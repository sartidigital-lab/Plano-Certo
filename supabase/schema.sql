-- Plano Certo - initial Supabase schema
-- Safe baseline: RLS enabled on all public tables. Policies below are intentionally
-- authenticated-first. Public/anon read access should be granted only after review.

create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists public.operators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ans_code text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.administrators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_plans (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references public.operators(id),
  administrator_id uuid references public.administrators(id),
  product_name text not null,
  ans_register text,
  segment text,
  contract_type text,
  region_scope text,
  network_summary text,
  copay_rule text,
  eligibility_summary text,
  status text not null default 'draft',
  confidence_level text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.price_tables (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references public.operators(id),
  administrator_id uuid references public.administrators(id),
  health_plan_id uuid references public.health_plans(id),
  region text not null,
  lives_min integer,
  lives_max integer,
  valid_from date,
  valid_until date,
  source_label text,
  status text not null default 'draft',
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.price_table_rows (
  id uuid primary key default gen_random_uuid(),
  price_table_id uuid not null references public.price_tables(id) on delete cascade,
  age_band text not null,
  accommodation text not null,
  monthly_price numeric(12, 2) not null,
  copay_variant text,
  notes text
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text,
  trade_name text not null,
  segment text,
  city text,
  state text,
  estimated_lives integer,
  current_provider text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  role text,
  phone text,
  email text,
  whatsapp_opt_in boolean not null default false,
  opt_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  primary_contact_id uuid references public.contacts(id),
  origin_channel text,
  score integer not null default 0,
  status text not null default 'new',
  pain_summary text,
  next_action text,
  assigned_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  stage text not null default 'qualified',
  expected_lives integer,
  expected_premium numeric(12, 2),
  close_probability integer,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('lead', 'agent', 'user', 'system')),
  sender_id uuid,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  risk_level text not null default 'low',
  requires_approval boolean not null default false,
  approved_by uuid,
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ans_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_url text,
  document_type text,
  version_label text,
  published_at date,
  imported_at timestamptz not null default now(),
  status text not null default 'active'
);

create table if not exists public.ans_document_chunks (
  id uuid primary key default gen_random_uuid(),
  ans_document_id uuid references public.ans_documents(id) on delete cascade,
  chunk_index integer not null,
  heading text,
  body text not null,
  citation_label text,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_rules (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  rule_text text not null,
  severity text not null default 'medium',
  required_action text not null default 'warn',
  source_document_id uuid references public.ans_documents(id),
  status text not null default 'active'
);

create table if not exists public.agent_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  status text not null default 'active',
  autonomy_level text not null default 'low',
  tone_of_voice text,
  humanization_score integer not null default 0,
  system_prompt_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_skills (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agent_profiles(id) on delete cascade,
  skill_name text not null,
  description text,
  enabled boolean not null default true
);

create table if not exists public.agent_guardrails (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agent_profiles(id) on delete cascade,
  rule_text text not null,
  severity text not null default 'medium',
  action text not null default 'require_approval'
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agent_profiles(id),
  lead_id uuid references public.leads(id),
  conversation_id uuid references public.conversations(id),
  run_type text not null,
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  risk_level text not null default 'low',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.human_approvals (
  id uuid primary key default gen_random_uuid(),
  agent_run_id uuid references public.agent_runs(id) on delete cascade,
  lead_id uuid references public.leads(id),
  proposed_message text not null,
  reason text,
  status text not null default 'pending',
  reviewer_id uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.operators enable row level security;
alter table public.administrators enable row level security;
alter table public.health_plans enable row level security;
alter table public.price_tables enable row level security;
alter table public.price_table_rows enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.ans_documents enable row level security;
alter table public.ans_document_chunks enable row level security;
alter table public.compliance_rules enable row level security;
alter table public.agent_profiles enable row level security;
alter table public.agent_skills enable row level security;
alter table public.agent_guardrails enable row level security;
alter table public.agent_runs enable row level security;
alter table public.human_approvals enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

create policy "authenticated read operators" on public.operators for select to authenticated using (true);
create policy "authenticated read administrators" on public.administrators for select to authenticated using (true);
create policy "authenticated read health plans" on public.health_plans for select to authenticated using (true);
create policy "authenticated read price tables" on public.price_tables for select to authenticated using (true);
create policy "authenticated read price rows" on public.price_table_rows for select to authenticated using (true);
create policy "authenticated read ans documents" on public.ans_documents for select to authenticated using (true);
create policy "authenticated read ans chunks" on public.ans_document_chunks for select to authenticated using (true);
create policy "authenticated read compliance rules" on public.compliance_rules for select to authenticated using (true);
create policy "authenticated read agent profiles" on public.agent_profiles for select to authenticated using (true);
create policy "authenticated read agent skills" on public.agent_skills for select to authenticated using (true);
create policy "authenticated read agent guardrails" on public.agent_guardrails for select to authenticated using (true);

create policy "authenticated manage companies" on public.companies for all to authenticated using (true) with check (true);
create policy "authenticated manage contacts" on public.contacts for all to authenticated using (true) with check (true);
create policy "authenticated manage leads" on public.leads for all to authenticated using (true) with check (true);
create policy "authenticated manage opportunities" on public.opportunities for all to authenticated using (true) with check (true);
create policy "authenticated manage conversations" on public.conversations for all to authenticated using (true) with check (true);
create policy "authenticated manage messages" on public.messages for all to authenticated using (true) with check (true);
create policy "authenticated manage agent runs" on public.agent_runs for all to authenticated using (true) with check (true);
create policy "authenticated manage approvals" on public.human_approvals for all to authenticated using (true) with check (true);

create index if not exists idx_health_plans_operator_id on public.health_plans(operator_id);
create index if not exists idx_health_plans_administrator_id on public.health_plans(administrator_id);
create index if not exists idx_health_plans_status on public.health_plans(status);
create index if not exists idx_health_plans_region_scope on public.health_plans(region_scope);
create index if not exists idx_price_tables_plan_id on public.price_tables(health_plan_id);
create index if not exists idx_price_tables_validity on public.price_tables(valid_from, valid_until);
create index if not exists idx_price_tables_status on public.price_tables(status);
create index if not exists idx_price_table_rows_table_id on public.price_table_rows(price_table_id);
create index if not exists idx_companies_trade_name on public.companies(trade_name);
create index if not exists idx_leads_status_score on public.leads(status, score desc);
create index if not exists idx_conversations_lead_id on public.conversations(lead_id);
create index if not exists idx_messages_conversation_created on public.messages(conversation_id, created_at);
create index if not exists idx_ans_chunks_document_id on public.ans_document_chunks(ans_document_id);
create index if not exists idx_agent_runs_agent_created on public.agent_runs(agent_id, created_at desc);
create index if not exists idx_human_approvals_status_created on public.human_approvals(status, created_at desc);
