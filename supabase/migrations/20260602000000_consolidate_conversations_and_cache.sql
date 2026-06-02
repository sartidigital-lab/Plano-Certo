-- 0. Ensure conversations table exists
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  channel text not null,
  status text not null default 'open',
  assigned_agent_id uuid,
  assigned_user_id uuid,
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

-- 1. Alter conversations table to support unified WhatsApp/Instagram fields
alter table public.conversations add column if not exists contact_identity text;
alter table public.conversations add column if not exists assigned_to_consultant boolean not null default false;
alter table public.conversations add column if not exists handoff_at timestamptz;
alter table public.conversations add column if not exists updated_at timestamptz not null default now();

-- 2. Migrate existing whatsapp_conversations data if table exists
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'whatsapp_conversations') then
    -- Insert old records into conversations
    insert into public.conversations (id, lead_id, channel, status, assigned_to_consultant, handoff_at, contact_identity, created_at, updated_at)
    select 
      id, 
      lead_id, 
      'whatsapp' as channel, 
      status, 
      assigned_to_consultant, 
      handoff_at, 
      phone_number as contact_identity, 
      created_at, 
      updated_at
    from public.whatsapp_conversations
    on conflict (id) do nothing;

    -- Drop old constraints on dependent tables referencing whatsapp_conversations
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'broker_handoffs') then
      alter table public.broker_handoffs drop constraint if exists broker_handoffs_conversation_id_fkey;
    end if;
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'messages') then
      alter table public.messages drop constraint if exists messages_conversation_id_fkey;
    end if;
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'agent_sessions') then
      alter table public.agent_sessions drop constraint if exists agent_sessions_conversation_id_fkey;
    end if;

    -- Drop old policies on whatsapp_conversations
    drop policy if exists "anon read whatsapp conversations" on public.whatsapp_conversations;
    drop policy if exists "anon create whatsapp conversations" on public.whatsapp_conversations;
    drop policy if exists "anon update whatsapp conversations" on public.whatsapp_conversations;
    drop policy if exists "authenticated manage whatsapp conversations" on public.whatsapp_conversations;

    -- Drop old table
    drop table public.whatsapp_conversations;
  end if;
end $$;

-- 3. Add constraint on dependent tables to point to unified conversations table
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'broker_handoffs') then
    alter table public.broker_handoffs drop constraint if exists broker_handoffs_conversation_id_fkey;
    alter table public.broker_handoffs add constraint broker_handoffs_conversation_id_fkey 
      foreign key (conversation_id) references public.conversations(id) on delete set null;
  end if;

  if exists (select from pg_tables where schemaname = 'public' and tablename = 'messages') then
    alter table public.messages drop constraint if exists messages_conversation_id_fkey;
    alter table public.messages add constraint messages_conversation_id_fkey 
      foreign key (conversation_id) references public.conversations(id) on delete cascade;
  end if;

  if exists (select from pg_tables where schemaname = 'public' and tablename = 'agent_sessions') then
    alter table public.agent_sessions drop constraint if exists agent_sessions_conversation_id_fkey;
    alter table public.agent_sessions add constraint agent_sessions_conversation_id_fkey 
      foreign key (conversation_id) references public.conversations(id) on delete cascade;
  end if;
end $$;

-- 4. Create unified inbound_webhook_events table
create table if not exists public.inbound_webhook_events (
  id uuid primary key default gen_random_uuid(),
  channel text not null, -- 'whatsapp' | 'instagram'
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

alter table public.inbound_webhook_events enable row level security;
grant select, insert, update on public.inbound_webhook_events to anon, authenticated;

create policy "anon insert webhook events" on public.inbound_webhook_events for insert to anon with check (true);
create policy "authenticated manage webhook events" on public.inbound_webhook_events for all to authenticated using (true) with check (true);

-- 5. Create google_places_cache table for automated prospecting
create table if not exists public.google_places_cache (
  id uuid primary key default gen_random_uuid(),
  place_id text unique not null,
  name text not null,
  segment text not null,
  phone text,
  website text,
  city text not null,
  state text not null,
  formatted_address text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'converted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.google_places_cache enable row level security;
grant select, insert, update, delete on public.google_places_cache to anon, authenticated;

create policy "authenticated manage places cache" on public.google_places_cache for all to authenticated using (true) with check (true);
create policy "anon read places cache" on public.google_places_cache for select to anon using (true);

-- 6. Add indexes
create index if not exists idx_conversations_contact_identity on public.conversations(contact_identity);
create index if not exists idx_inbound_webhook_events_created on public.inbound_webhook_events(created_at desc);
create index if not exists idx_google_places_cache_segment_city on public.google_places_cache(segment, city);
create index if not exists idx_google_places_cache_status on public.google_places_cache(status);
