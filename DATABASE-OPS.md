# Plano Certo - Operação e expansão do banco

## Objetivo

Manter o banco preparado para crescer de protótipo para CRM operacional com agentes, histórico de conversas, catálogo comercial, tabelas de preço e Base ANS.

## Responsabilidades da camada de dados

- Preservar histórico comercial e regulatório.
- Versionar tabelas de preço e documentos ANS.
- Separar dados operacionais de dados de conhecimento.
- Manter rastreabilidade de agentes, aprovações humanas e mensagens enviadas.
- Garantir que cobertura, carência e reajuste tenham fonte; preço por operadora/região deve ser confirmado por corretor humano antes de virar proposta.

## Estratégia de crescimento

### Fase 1 - Mock + schema
- Frontend usa services com fallback mock.
- `supabase/schema.sql` cria as tabelas alvo.
- `supabase/seed.sql` popula dados iniciais de desenvolvimento.

### Fase 2 - Leitura real
- Conectar primeiro módulos de baixo risco:
  - Catálogo
  - Tabelas de preço
  - Base ANS
  - Agentes
- Manter fallback mock enquanto o banco amadurece.
- Validar cada carga com `supabase/verification.sql` antes de apontar Vercel para o projeto real.

Status em 2026-05-16:
- Projeto Supabase ativo: `Plano Certo` (`errbmfumiixmyjiltdtq`).
- `.env.local` local aponta para `https://errbmfumiixmyjiltdtq.supabase.co`.
- Leitura real validada para catálogo, tabelas de preço, Base ANS e agentes.
- Relações usadas pelo frontend validadas: `operators`, `administrators`, `price_table_rows`, `agent_skills` e `agent_guardrails`.

Redefinição em 2026-05-17:
- O fluxo atual não usa tabela por operadora/UF como cotação automática.
- O agente qualifica o lead, identifica UF/região, quantidade de vidas, perfil da empresa e urgência.
- O agente sugere possíveis caminhos de atendimento e encaminha ao corretor humano.
- O corretor confirma tabela, preço, operadora, região e condições comerciais antes de enviar proposta.
- `price_tables` permanece como base interna de referência/validação, não como fonte final para resposta automática ao cliente.

### Fase 3 - Operação CRM
- Persistir leads, conversas, mensagens, oportunidades e aprovações.
- Introduzir autenticação e escopo por corretora/equipe.
- Trocar policies amplas por policies baseadas em organização e usuário.

### Fase 4 - Agentes e RAG
- Popular `ans_document_chunks`.
- Gerar embeddings.
- Registrar `agent_runs`, citações, decisões e bloqueios.
- Criar auditoria para toda mensagem enviada.

## Monitoramento mínimo

- Volume de mensagens por conversa.
- Tempo médio de resposta por canal.
- Taxa de aprovações humanas pendentes.
- Runs de agente por status: concluído, revisão, bloqueado, erro.
- Handoffs pendentes de confirmação humana de tabela/região.
- Tabelas de preço internas próximas do vencimento.
- Documentos ANS com status `review`.
- Queries lentas por tabela operacional.

## Verificação de carga

Depois de aplicar `supabase/schema.sql` e `supabase/seed.sql`, executar:

```sql
\i supabase/verification.sql
```

Critérios mínimos:
- `health_plans` com pelo menos 4 registros.
- `price_tables` com pelo menos 3 registros.
- `price_table_rows` sem duplicidade por tabela/faixa/acomodação.
- todas as tabelas públicas com RLS ativo.
- índices `idx_*` criados para tabelas operacionais.

Do frontend/local, também rodar:

```bash
npm run supabase:check
```

Interpretação:
- `readable`: a tabela está exposta e legível com a chave configurada.
- `protected by auth/RLS`: a tabela existe, mas exige usuário autenticado ou policy mais específica.
- `missing or not exposed`: schema ainda não foi aplicado ou a tabela não está exposta pela Data API.

## Índices iniciais

O schema já inclui índices para:
- planos por operadora, administradora, status e região
- tabelas por plano, vigência e status
- leads por status e score
- mensagens por conversa/data
- runs por agente/data
- aprovações por status/data

## RLS e segurança

Estado atual:
- RLS habilitado em todas as tabelas públicas.
- Policies iniciais liberam leitura para `anon` nas tabelas de baixo risco usadas pelo frontend público.
- Policies iniciais liberam gerenciamento para `authenticated` nessas mesmas tabelas.
- Tabelas operacionais existentes no projeto (`tenants`, `leads`, `messages`, campanhas e filas) não foram substituídas.

Variáveis necessárias no deploy:

```bash
VITE_SUPABASE_URL=https://errbmfumiixmyjiltdtq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key ativa do projeto Plano Certo>
```

Próxima evolução:
- Criar `organizations`.
- Relacionar usuários, empresas, leads, conversas e agentes a uma organização.
- Trocar `using (true)` por checks baseados em membership.
- Manter service role apenas em backend/Edge Functions, nunca no frontend.

## Regras de dados críticos

- Nunca prometer ou enviar preço por operadora/região sem confirmação do corretor humano.
- Nunca sobrescrever tabela de preço ativa: arquivar e criar nova versão.
- Nunca apagar conversa; usar status ou soft delete quando necessário.
- Nunca enviar mensagem de agente sem guardar proposta, aprovação e payload.
- Nunca responder sobre ANS sem documento fonte quando a resposta tocar cobertura, carência, reajuste, registro ou portabilidade.

## Próximas melhorias de schema

- `organizations`
- `organization_members`
- `broker_handoffs`
- `google_places_cache`
- `lead_enrichment_events`
- `whatsapp_webhook_events`
- `quote_requests`
- `quote_items`
- `agent_citations`
- `source_files`
- `imports`
- `import_errors`
- `audit_events`
