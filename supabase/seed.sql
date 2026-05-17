-- Plano Certo - initial mock seed
-- Run after supabase/schema.sql in a development project.

insert into public.operators (id, name, ans_code, status) values
  ('00000000-0000-0000-0000-000000000101', 'Amil', null, 'active'),
  ('00000000-0000-0000-0000-000000000102', 'SulAmérica', null, 'active'),
  ('00000000-0000-0000-0000-000000000103', 'Bradesco Saúde', null, 'active'),
  ('00000000-0000-0000-0000-000000000104', 'Unimed', null, 'active')
on conflict (id) do update set name = excluded.name, status = excluded.status;

insert into public.administrators (id, name, status) values
  ('00000000-0000-0000-0000-000000000201', 'Qualicorp Empresas', 'active'),
  ('00000000-0000-0000-0000-000000000202', 'AllCare PME', 'active'),
  ('00000000-0000-0000-0000-000000000203', 'PME Direto', 'active'),
  ('00000000-0000-0000-0000-000000000204', 'Unimed Regional', 'active')
on conflict (id) do update set name = excluded.name, status = excluded.status;

insert into public.health_plans (
  id, operator_id, administrator_id, product_name, ans_register, segment,
  contract_type, region_scope, network_summary, copay_rule, eligibility_summary,
  status, confidence_level
) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', 'Amil Select PME 250', '473.221/19-1', 'Ambulatorial + Hospitalar com obstetrícia', 'Coletivo empresarial', 'São Paulo capital e Grande SP', 'Rede regional com hospitais parceiros e laboratórios premium', 'Opcional', '3 a 99 vidas', 'active', 'high'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000202', 'SulAmérica Exato Empresarial', '489.110/21-7', 'Ambulatorial + Hospitalar com obstetrícia', 'Coletivo empresarial', 'Rio de Janeiro metropolitano', 'Rede referenciada RJ com pronto atendimento e hospitais gerais', 'Sem coparticipação', '5 a 199 vidas', 'review', 'medium'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000203', 'Efetivo Flex Empresarial', '455.009/18-0', 'Hospitalar com obstetrícia', 'Coletivo empresarial', 'Curitiba e região metropolitana', 'Rede ampla regional com acomodação enfermaria', 'Parcial em consultas e exames simples', '10 a 250 vidas', 'active', 'high'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000204', 'Unimed Fácil Empresa', '401.883/16-2', 'Ambulatorial + Hospitalar', 'Coletivo empresarial', 'Belo Horizonte', 'Rede própria e cooperada local', 'Obrigatória', '2 a 49 vidas', 'active', 'high')
on conflict (id) do update set product_name = excluded.product_name, status = excluded.status;

insert into public.price_tables (
  id, operator_id, administrator_id, health_plan_id, region, lives_min, lives_max,
  valid_from, valid_until, source_label, status
) values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', 'SP capital', 3, 29, '2026-05-01', '2026-07-31', 'XLSX comercial aprovado', 'active'),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000302', 'RJ metropolitano', 5, 99, '2026-04-01', '2026-06-30', 'PDF administradora', 'review'),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000303', 'Curitiba', 10, 250, '2026-05-01', '2026-05-31', 'Planilha comercial interna', 'active')
on conflict (id) do update set region = excluded.region, status = excluded.status;

insert into public.price_table_rows (price_table_id, age_band, accommodation, monthly_price) values
  ('00000000-0000-0000-0000-000000000401', '00-18', 'enfermaria', 188.40),
  ('00000000-0000-0000-0000-000000000401', '00-18', 'apartamento', 207.10),
  ('00000000-0000-0000-0000-000000000401', '19-23', 'enfermaria', 226.80),
  ('00000000-0000-0000-0000-000000000401', '19-23', 'apartamento', 249.50),
  ('00000000-0000-0000-0000-000000000401', '24-28', 'enfermaria', 262.30),
  ('00000000-0000-0000-0000-000000000401', '24-28', 'apartamento', 288.50),
  ('00000000-0000-0000-0000-000000000401', '29-33', 'enfermaria', 315.90),
  ('00000000-0000-0000-0000-000000000401', '29-33', 'apartamento', 347.50)
on conflict (price_table_id, age_band, accommodation) do update
set monthly_price = excluded.monthly_price;

insert into public.ans_documents (id, title, source_url, document_type, version_label, status) values
  ('00000000-0000-0000-0000-000000000501', 'Rol de Procedimentos e Eventos em Saúde', 'https://www.gov.br/ans/', 'Cobertura obrigatória', 'mock', 'active'),
  ('00000000-0000-0000-0000-000000000502', 'Reajuste de planos coletivos empresariais', 'https://www.gov.br/ans/', 'Reajuste e contrato', 'mock', 'active'),
  ('00000000-0000-0000-0000-000000000503', 'Carências, CPT e portabilidade', 'https://www.gov.br/ans/', 'Elegibilidade', 'mock', 'review'),
  ('00000000-0000-0000-0000-000000000504', 'Registro e situação de produto', 'https://www.gov.br/ans/', 'Produto', 'mock', 'active')
on conflict (id) do update set title = excluded.title, status = excluded.status;

insert into public.agent_profiles (id, name, role, status, autonomy_level, tone_of_voice, humanization_score) values
  ('00000000-0000-0000-0000-000000000601', 'Agente de atendimento', 'Responde dúvidas iniciais, coleta contexto e prepara handoff.', 'active', 'low', 'Calmo, acolhedor e objetivo', 91),
  ('00000000-0000-0000-0000-000000000602', 'Agente outbound', 'Pesquisa empresas, gera abordagem e controla cadência com permissão.', 'active', 'medium', 'Consultivo, breve e respeitoso', 88),
  ('00000000-0000-0000-0000-000000000603', 'Agente de cotação', 'Cruza região, vidas, catálogo e tabelas para preparar cenários.', 'review', 'low', 'Preciso, transparente e sem exagero comercial', 84),
  ('00000000-0000-0000-0000-000000000604', 'Agente compliance ANS', 'Revisa mensagens sobre cobertura, carência, reajuste e registro.', 'active', 'high_review', 'Técnico, claro e seguro', 86)
on conflict (id) do update set name = excluded.name, status = excluded.status, humanization_score = excluded.humanization_score;

insert into public.agent_skills (agent_id, skill_name, description, enabled) values
  ('00000000-0000-0000-0000-000000000601', 'Triagem inicial', 'Coleta contexto e identifica necessidade do lead.', true),
  ('00000000-0000-0000-0000-000000000602', 'Prospeccao outbound', 'Pesquisa empresas e prepara abordagem consultiva.', true),
  ('00000000-0000-0000-0000-000000000603', 'Cotacao assistida', 'Cruza planos, regiao e faixa de vidas.', true),
  ('00000000-0000-0000-0000-000000000604', 'Revisao ANS', 'Verifica pontos regulatorios antes de resposta.', true)
on conflict (agent_id, skill_name) do update
set description = excluded.description,
    enabled = excluded.enabled;

insert into public.agent_guardrails (agent_id, rule_text, severity, action) values
  ('00000000-0000-0000-0000-000000000601', 'Nao prometer cobertura ou preco sem base validada.', 'high', 'require_approval'),
  ('00000000-0000-0000-0000-000000000602', 'Respeitar opt-out e evitar insistencia apos recusa.', 'high', 'block'),
  ('00000000-0000-0000-0000-000000000603', 'Sinalizar divergencia entre tabela e elegibilidade.', 'medium', 'require_approval'),
  ('00000000-0000-0000-0000-000000000604', 'Encaminhar temas regulatorios sensiveis para revisao humana.', 'high', 'require_approval')
on conflict (agent_id, rule_text) do update
set severity = excluded.severity,
    action = excluded.action;
