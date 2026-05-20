-- Plano Certo - WhatsApp webhook events
-- Keeps raw inbound Meta webhook payloads for audit, troubleshooting, and replay.

create table if not exists public.whatsapp_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null default 'unknown',
  external_id text,
  phone_number_id text,
  wa_id text,
  payload jsonb not null default '{}'::jsonb,
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processed', 'ignored', 'error')),
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.whatsapp_webhook_events enable row level security;

create index if not exists idx_whatsapp_webhook_events_created
on public.whatsapp_webhook_events(created_at desc);

create index if not exists idx_whatsapp_webhook_events_external_id
on public.whatsapp_webhook_events(external_id)
where external_id is not null;

create index if not exists idx_whatsapp_webhook_events_type_created
on public.whatsapp_webhook_events(event_type, created_at desc);
