-- Plano Certo - broker handoffs
-- Stores the safe summary that agents prepare for human broker confirmation.

create table if not exists public.broker_handoffs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id),
  lead_id uuid references public.leads(id) on delete set null,
  conversation_id uuid references public.whatsapp_conversations(id) on delete set null,
  summary text not null,
  classification text not null,
  urgency text not null default 'Nutrir',
  region text,
  estimated_lives text,
  pending_questions text[] not null default '{}'::text[],
  suggested_paths jsonb not null default '[]'::jsonb,
  price_confirmation_required boolean not null default true,
  table_confirmation_status text not null default 'pending'
    check (table_confirmation_status in ('pending', 'confirmed', 'rejected', 'not_applicable')),
  status text not null default 'pending'
    check (status in ('pending', 'assigned', 'in_progress', 'completed', 'canceled')),
  created_by text not null default 'agent',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.broker_handoffs enable row level security;

grant select, insert, update on public.broker_handoffs to anon, authenticated;

drop policy if exists "anon read broker handoffs" on public.broker_handoffs;
create policy "anon read broker handoffs"
on public.broker_handoffs
for select
to anon
using (true);

drop policy if exists "anon create broker handoffs" on public.broker_handoffs;
create policy "anon create broker handoffs"
on public.broker_handoffs
for insert
to anon
with check (true);

drop policy if exists "authenticated manage broker handoffs" on public.broker_handoffs;
create policy "authenticated manage broker handoffs"
on public.broker_handoffs
for all
to authenticated
using (true)
with check (true);

create index if not exists idx_broker_handoffs_lead_created
on public.broker_handoffs(lead_id, created_at desc);

create index if not exists idx_broker_handoffs_status_created
on public.broker_handoffs(status, created_at desc);
