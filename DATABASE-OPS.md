# Plano Certo - Operação e expansão do banco

## Objetivo

Manter o banco preparado para crescer de protótipo para CRM operacional com agentes, histórico de conversas, catálogo comercial, tabelas de preço e Base ANS.

## Responsabilidades da camada de dados

- Preservar histórico comercial e regulatório.
- Versionar tabelas de preço e documentos ANS.
- Separar dados operacionais de dados de conhecimento.
- Manter rastreabilidade de agentes, aprovações humanas e mensagens enviadas.
- Garantir que preço, cobertura, carência e reajuste sempre tenham fonte ou tabela vigente.

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
- Tabelas de preço próximas do vencimento.
- Documentos ANS com status `review`.
- Queries lentas por tabela operacional.

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
- Policies iniciais liberam acesso para `authenticated`.
- Nenhuma policy foi criada para `anon`.

Próxima evolução:
- Criar `organizations`.
- Relacionar usuários, empresas, leads, conversas e agentes a uma organização.
- Trocar `using (true)` por checks baseados em membership.
- Manter service role apenas em backend/Edge Functions, nunca no frontend.

## Regras de dados críticos

- Nunca sobrescrever tabela de preço ativa: arquivar e criar nova versão.
- Nunca apagar conversa; usar status ou soft delete quando necessário.
- Nunca enviar mensagem de agente sem guardar proposta, aprovação e payload.
- Nunca responder sobre ANS sem documento fonte quando a resposta tocar cobertura, carência, reajuste, registro ou portabilidade.

## Próximas melhorias de schema

- `organizations`
- `organization_members`
- `quote_requests`
- `quote_items`
- `agent_citations`
- `source_files`
- `imports`
- `import_errors`
- `audit_events`
