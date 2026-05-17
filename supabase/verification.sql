-- Plano Certo - database verification checks
-- Use after schema + seed to confirm the minimum data shape is safe.

select 'operators' as table_name, count(*) as total from public.operators
union all select 'administrators', count(*) from public.administrators
union all select 'health_plans', count(*) from public.health_plans
union all select 'price_tables', count(*) from public.price_tables
union all select 'price_table_rows', count(*) from public.price_table_rows
union all select 'ans_documents', count(*) from public.ans_documents
union all select 'agent_profiles', count(*) from public.agent_profiles
union all select 'agent_skills', count(*) from public.agent_skills
union all select 'agent_guardrails', count(*) from public.agent_guardrails;

select
  pt.id,
  hp.product_name,
  pt.region,
  count(ptr.id) as price_rows
from public.price_tables pt
left join public.health_plans hp on hp.id = pt.health_plan_id
left join public.price_table_rows ptr on ptr.price_table_id = pt.id
group by pt.id, hp.product_name, pt.region
order by hp.product_name;

select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'operators',
    'administrators',
    'health_plans',
    'price_tables',
    'price_table_rows',
    'companies',
    'contacts',
    'leads',
    'opportunities',
    'conversations',
    'messages',
    'ans_documents',
    'ans_document_chunks',
    'compliance_rules',
    'agent_profiles',
    'agent_skills',
    'agent_guardrails',
    'agent_runs',
    'human_approvals'
  )
order by tablename;

select
  indexname,
  tablename
from pg_indexes
where schemaname = 'public'
  and indexname like 'idx_%'
order by tablename, indexname;
