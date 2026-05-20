import { createClient } from 'npm:@supabase/supabase-js@2';

type SupabaseClient = ReturnType<typeof createClient>;

const jsonHeaders = {
  'Content-Type': 'application/json',
};

Deno.serve(async (request) => {
  try {
    if (request.method === 'GET') return verifyWebhook(request);
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const rawBody = await request.text();
    const appSecret = Deno.env.get('WHATSAPP_APP_SECRET');

    if (appSecret) {
      const signature = request.headers.get('x-hub-signature-256');
      const isValid = await verifyMetaSignature(rawBody, signature, appSecret);
      if (!isValid) return jsonResponse({ error: 'Invalid signature' }, 401);
    }

    const payload = JSON.parse(rawBody);
    const supabase = createAdminClient();
    const result = await processWebhookPayload(supabase, payload);

    return jsonResponse({ ok: true, ...result });
  } catch (error) {
    console.error('WhatsApp webhook error', error);
    return jsonResponse({ ok: false, error: error.message || 'Unexpected webhook error' }, 500);
  }
});

function verifyWebhook(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const expectedToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');

  if (mode === 'subscribe' && token && token === expectedToken && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return jsonResponse({ error: 'Webhook verification failed' }, 403);
}

function createAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function processWebhookPayload(supabase: SupabaseClient, payload: any) {
  const changes = extractChanges(payload);
  let messagesProcessed = 0;
  let statusesProcessed = 0;

  for (const change of changes) {
    const value = change.value || {};
    const phoneNumberId = value.metadata?.phone_number_id || null;

    await recordWebhookEvent(supabase, {
      eventType: change.field || 'messages',
      phoneNumberId,
      payload: change,
      processingStatus: 'received',
    });

    for (const message of value.messages || []) {
      await processInboundMessage(supabase, value, message, phoneNumberId);
      messagesProcessed += 1;
    }

    for (const status of value.statuses || []) {
      await processMessageStatus(supabase, status, phoneNumberId);
      statusesProcessed += 1;
    }
  }

  return {
    changes: changes.length,
    messagesProcessed,
    statusesProcessed,
  };
}

function extractChanges(payload: any) {
  return (payload.entry || []).flatMap((entry: any) => entry.changes || []);
}

async function processInboundMessage(
  supabase: SupabaseClient,
  value: any,
  message: any,
  phoneNumberId: string | null,
) {
  const existingMessage = await supabase
    .from('messages')
    .select('id')
    .eq('external_id', message.id)
    .maybeSingle();

  if (existingMessage.data?.id) {
    await recordWebhookEvent(supabase, {
      eventType: 'message_duplicate',
      externalId: message.id,
      phoneNumberId,
      waId: message.from,
      payload: message,
      processingStatus: 'ignored',
    });
    return;
  }

  const conversation = await findOrCreateConversation(supabase, value, message);
  const content = extractMessageContent(message);

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversation.id,
    lead_id: conversation.lead_id,
    direction: 'inbound',
    channel: 'whatsapp',
    content,
    sent_by: 'lead',
    external_id: message.id,
    status: 'sent',
  });

  if (error) throw error;

  await supabase
    .from('whatsapp_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversation.id);

  await recordWebhookEvent(supabase, {
    eventType: 'message_inbound',
    externalId: message.id,
    phoneNumberId: value.metadata?.phone_number_id || null,
    waId: message.from,
    payload: message,
    processingStatus: 'processed',
  });
}

async function findOrCreateConversation(supabase: SupabaseClient, value: any, message: any) {
  const phoneNumber = message.from;
  const existing = await supabase
    .from('whatsapp_conversations')
    .select('id, lead_id')
    .eq('phone_number', phoneNumber)
    .eq('channel', 'whatsapp')
    .neq('status', 'closed')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing.error) throw existing.error;
  if (existing.data) return existing.data;

  const created = await supabase
    .from('whatsapp_conversations')
    .insert({
      phone_number: phoneNumber,
      channel: 'whatsapp',
      status: 'active',
    })
    .select('id, lead_id')
    .single();

  if (created.error) throw created.error;
  return created.data;
}

async function processMessageStatus(supabase: SupabaseClient, status: any, phoneNumberId: string | null) {
  const normalizedStatus = normalizeMessageStatus(status.status);

  if (normalizedStatus) {
    await supabase
      .from('messages')
      .update({ status: normalizedStatus })
      .eq('external_id', status.id);
  }

  await recordWebhookEvent(supabase, {
    eventType: 'message_status',
    externalId: status.id,
    phoneNumberId,
    waId: status.recipient_id,
    payload: status,
    processingStatus: normalizedStatus ? 'processed' : 'ignored',
  });
}

async function recordWebhookEvent(
  supabase: SupabaseClient,
  event: {
    eventType: string;
    externalId?: string | null;
    phoneNumberId?: string | null;
    waId?: string | null;
    payload: any;
    processingStatus: 'received' | 'processed' | 'ignored' | 'error';
    errorMessage?: string | null;
  },
) {
  const { error } = await supabase.from('whatsapp_webhook_events').insert({
    event_type: event.eventType,
    external_id: event.externalId || null,
    phone_number_id: event.phoneNumberId || null,
    wa_id: event.waId || null,
    payload: event.payload,
    processing_status: event.processingStatus,
    error_message: event.errorMessage || null,
  });

  if (error) console.error('Could not record webhook event', error);
}

function extractMessageContent(message: any) {
  if (message.text?.body) return message.text.body;
  if (message.button?.text) return message.button.text;
  if (message.interactive?.button_reply?.title) return message.interactive.button_reply.title;
  if (message.interactive?.list_reply?.title) return message.interactive.list_reply.title;
  if (message.image) return '[Imagem recebida]';
  if (message.document) return '[Documento recebido]';
  if (message.audio) return '[Audio recebido]';
  if (message.video) return '[Video recebido]';
  return `[Mensagem ${message.type || 'desconhecida'} recebida]`;
}

function normalizeMessageStatus(status: string | undefined) {
  if (status === 'sent') return 'sent';
  if (status === 'delivered') return 'delivered';
  if (status === 'read') return 'read';
  if (status === 'failed') return 'failed';
  return null;
}

async function verifyMetaSignature(rawBody: string, signature: string | null, appSecret: string) {
  if (!signature?.startsWith('sha256=')) return false;

  const expectedDigest = signature.replace('sha256=', '');
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const actualDigest = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return timingSafeEqual(actualDigest, expectedDigest);
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}
