-- Plano Certo - public catalog and agent read model
-- Mirrors the low-risk Supabase tables currently used by the frontend.

create extension if not exists pgcrypto;

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

alter table public.operators enable row level security;
alter table public.administrators enable row level security;
alter table public.health_plans enable row level security;
alter table public.price_tables enable row level security;
alter table public.price_table_rows enable row level security;
alter table public.ans_documents enable row level security;
alter table public.agent_profiles enable row level security;
alter table public.agent_skills enable row level security;
alter table public.agent_guardrails enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.operators, public.administrators, public.health_plans, public.price_tables, public.price_table_rows, public.ans_documents, public.agent_profiles, public.agent_skills, public.agent_guardrails to anon, authenticated;
grant insert, update, delete on public.operators, public.administrators, public.health_plans, public.price_tables, public.price_table_rows, public.ans_documents, public.agent_profiles, public.agent_skills, public.agent_guardrails to authenticated;

drop policy if exists "anon read operators" on public.operators;
drop policy if exists "anon read administrators" on public.administrators;
drop policy if exists "anon read health plans" on public.health_plans;
drop policy if exists "anon read price tables" on public.price_tables;
drop policy if exists "anon read price rows" on public.price_table_rows;
drop policy if exists "anon read ans documents" on public.ans_documents;
drop policy if exists "anon read agent profiles" on public.agent_profiles;
drop policy if exists "anon read agent skills" on public.agent_skills;
drop policy if exists "anon read agent guardrails" on public.agent_guardrails;

create policy "anon read operators" on public.operators for select to anon using (true);
create policy "anon read administrators" on public.administrators for select to anon using (true);
create policy "anon read health plans" on public.health_plans for select to anon using (true);
create policy "anon read price tables" on public.price_tables for select to anon using (true);
create policy "anon read price rows" on public.price_table_rows for select to anon using (true);
create policy "anon read ans documents" on public.ans_documents for select to anon using (true);
create policy "anon read agent profiles" on public.agent_profiles for select to anon using (true);
create policy "anon read agent skills" on public.agent_skills for select to anon using (true);
create policy "anon read agent guardrails" on public.agent_guardrails for select to anon using (true);

drop policy if exists "authenticated manage operators" on public.operators;
drop policy if exists "authenticated manage administrators" on public.administrators;
drop policy if exists "authenticated manage health plans" on public.health_plans;
drop policy if exists "authenticated manage price tables" on public.price_tables;
drop policy if exists "authenticated manage price rows" on public.price_table_rows;
drop policy if exists "authenticated manage ans documents" on public.ans_documents;
drop policy if exists "authenticated manage agent profiles" on public.agent_profiles;
drop policy if exists "authenticated manage agent skills" on public.agent_skills;
drop policy if exists "authenticated manage agent guardrails" on public.agent_guardrails;

create policy "authenticated manage operators" on public.operators for all to authenticated using (true) with check (true);
create policy "authenticated manage administrators" on public.administrators for all to authenticated using (true) with check (true);
create policy "authenticated manage health plans" on public.health_plans for all to authenticated using (true) with check (true);
create policy "authenticated manage price tables" on public.price_tables for all to authenticated using (true) with check (true);
create policy "authenticated manage price rows" on public.price_table_rows for all to authenticated using (true) with check (true);
create policy "authenticated manage ans documents" on public.ans_documents for all to authenticated using (true) with check (true);
create policy "authenticated manage agent profiles" on public.agent_profiles for all to authenticated using (true) with check (true);
create policy "authenticated manage agent skills" on public.agent_skills for all to authenticated using (true) with check (true);
create policy "authenticated manage agent guardrails" on public.agent_guardrails for all to authenticated using (true) with check (true);

create index if not exists idx_health_plans_operator_id on public.health_plans(operator_id);
create index if not exists idx_health_plans_administrator_id on public.health_plans(administrator_id);
create index if not exists idx_health_plans_status on public.health_plans(status);
create index if not exists idx_health_plans_region_scope on public.health_plans(region_scope);
create index if not exists idx_price_tables_plan_id on public.price_tables(health_plan_id);
create index if not exists idx_price_tables_validity on public.price_tables(valid_from, valid_until);
create index if not exists idx_price_tables_status on public.price_tables(status);
create index if not exists idx_price_table_rows_table_id on public.price_table_rows(price_table_id);
create unique index if not exists idx_price_table_rows_unique_band on public.price_table_rows(price_table_id, age_band, accommodation);
create index if not exists idx_agent_skills_agent_id on public.agent_skills(agent_id);
create index if not exists idx_agent_guardrails_agent_id on public.agent_guardrails(agent_id);
create unique index if not exists idx_agent_skills_unique_name on public.agent_skills(agent_id, skill_name);
create unique index if not exists idx_agent_guardrails_unique_rule on public.agent_guardrails(agent_id, rule_text);
