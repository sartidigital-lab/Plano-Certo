import { conversations, leadProfiles, leads, pipelineColumns } from '../data/mockData.js';
import { supabase } from '../lib/supabaseClient.js';

export function listLeads() {
  return leads;
}

export async function fetchLeads() {
  if (!supabase) return leads;

  const { data, error } = await supabase
    .from('leads')
    .select('id, company_name, region, segment, source_channel, score, score_band, status, pipeline_stage, tags, created_at')
    .order('score', { ascending: false })
    .limit(20);

  if (error || !data || data.length === 0) {
    console.warn('Using mock leads after Supabase error:', error?.message);
    return leads;
  }

  return data.map((lead) => ({
    id: lead.id,
    company: lead.company_name || 'Empresa sem nome',
    origin: [lead.source_channel, lead.region].filter(Boolean).join(' · ') || 'Origem nao informada',
    lives: extractLives(lead.tags) || normalizeSegment(lead.segment),
    status: normalizeLeadStatus(lead.status, lead.pipeline_stage, lead.score_band),
    score: lead.score || 0,
  }));
}

export function listLeadProfiles() {
  return leadProfiles;
}

export function getLeadProfileById(id) {
  return leadProfiles.find((lead) => lead.id === id) || leadProfiles[0];
}

export function listConversations() {
  return conversations.map((conversation, index) => ({
    id: `mock-conversation-${index + 1}`,
    company: conversation.company,
    channel: conversation.channel,
    summary: conversation.summary,
    score: conversation.score,
    status: conversation.status,
    conversationStatus: 'active',
    assignedToConsultant: index === 0,
    meta: index === 0 ? '32 vidas · São Paulo · decisor financeiro' : 'Contexto a confirmar',
  }));
}

export function listConversationMessages() {
  return [
    { id: 'mock-message-1', from: 'lead', text: 'Bom dia. Temos 32 colaboradores e queremos rever o plano atual.' },
    { id: 'mock-message-2', from: 'agent', text: 'Perfeito. Vocês têm operadora atual e alguma preferência de hospitais na região?' },
    { id: 'mock-message-3', from: 'lead', text: 'Hoje usamos Notredame, mas o reajuste veio alto. Precisamos de rede em Pinheiros e Osasco.' },
    { id: 'mock-message-4', from: 'agent', text: 'Entendi. Vou encaminhar para um corretor com experiência em PME e rede oeste de SP.' },
  ];
}

export async function fetchConversations() {
  if (!supabase) return listConversations();

  const { data, error } = await supabase
    .from('whatsapp_conversations')
    .select('id, lead_id, phone_number, channel, assigned_to_consultant, handoff_at, status, created_at, updated_at, leads(company_name, region, segment, score)')
    .order('updated_at', { ascending: false })
    .limit(30);

  if (error) throw error;
  if (!data || data.length === 0) return listConversations();

  return data.map(mapConversation);
}

export async function fetchConversationMessages(conversationId) {
  if (!supabase || !isUuid(conversationId)) return listConversationMessages();

  const { data, error } = await supabase
    .from('messages')
    .select('id, direction, content, sent_by, agent_name, status, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(80);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  return data.map((message) => ({
    id: message.id,
    from: message.direction === 'inbound' || message.sent_by === 'lead' ? 'lead' : 'agent',
    text: message.content,
    status: message.status,
    createdAt: message.created_at,
  }));
}

export async function sendConversationMessage(conversation, text) {
  if (!supabase || !isUuid(conversation?.id)) {
    return {
      id: `mock-message-${Date.now()}`,
      from: 'agent',
      text,
      status: 'sent',
      mode: 'mock',
    };
  }

  const channel = ['whatsapp', 'instagram'].includes(String(conversation.channel).toLowerCase())
    ? String(conversation.channel).toLowerCase()
    : 'whatsapp';

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      lead_id: isUuid(conversation.leadId) ? conversation.leadId : null,
      direction: 'outbound',
      channel,
      content: text,
      sent_by: 'consultant',
      status: 'sent',
    })
    .select('id, direction, content, sent_by, status, created_at')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    from: 'agent',
    text: data.content,
    status: data.status,
    createdAt: data.created_at,
    mode: 'supabase',
  };
}

export async function claimConversation(conversationId) {
  if (!supabase || !isUuid(conversationId)) return { id: conversationId, mode: 'mock' };

  const { data, error } = await supabase
    .from('whatsapp_conversations')
    .update({
      assigned_to_consultant: true,
      handoff_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .select('id, assigned_to_consultant, handoff_at')
    .single();

  if (error) throw error;
  return { ...data, mode: 'supabase' };
}

export function listPipelineColumns() {
  return pipelineColumns;
}

function mapConversation(conversation) {
  const lead = conversation.leads || {};
  const channel = normalizeChannel(conversation.channel);

  return {
    id: conversation.id,
    leadId: conversation.lead_id,
    company: lead.company_name || conversation.phone_number || 'Contato sem nome',
    channel,
    summary: buildConversationSummary(conversation, lead),
    score: lead.score || (conversation.assigned_to_consultant ? 82 : 68),
    status: conversation.assigned_to_consultant ? 'success' : 'warn',
    conversationStatus: conversation.status || 'active',
    assignedToConsultant: Boolean(conversation.assigned_to_consultant),
    meta: [lead.segment, lead.region, conversation.phone_number].filter(Boolean).join(' · ') || 'Contexto a confirmar',
    updatedAt: conversation.updated_at || conversation.created_at,
  };
}

function buildConversationSummary(conversation, lead) {
  if (conversation.assigned_to_consultant) return 'repasse humano iniciado; corretor deve conduzir próximos passos.';
  if (lead.segment || lead.region) return 'aguardando qualificação final antes do repasse.';
  return 'conversa recebida; contexto comercial a confirmar.';
}

function normalizeChannel(channel) {
  if (!channel) return 'WhatsApp';
  return channel.charAt(0).toUpperCase() + channel.slice(1);
}

function extractLives(tags) {
  if (!Array.isArray(tags)) return null;
  const match = tags.find((tag) => /\d+\s*vidas?/i.test(tag));
  return match ? match.replace(/[^\d]/g, '') || match : null;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function normalizeSegment(segment) {
  if (!segment) return 'N/D';
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function normalizeLeadStatus(status, pipelineStage, scoreBand) {
  if (scoreBand === 'A' || Number(scoreBand) >= 85) return 'Quente';
  if (pipelineStage && pipelineStage !== 'Novo Lead') return pipelineStage;
  if (status === 'new') return 'Novo';
  if (status === 'qualified') return 'Quente';
  if (status === 'nurture') return 'Nutrir';
  return status || 'Novo';
}
