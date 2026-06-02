# Plano Certo - Phase 2 Execution Plan (Supabase Schema & Webhooks)

Este plano descreve as etapas para atualizar o banco de dados no Supabase e a Edge Function de webhook para unificar o atendimento do WhatsApp e Instagram e gerenciar o cache do Google Places.

## Objetivos da Fase
- Unificar a tabela `conversations` para suportar múltiplos canais (WhatsApp e Instagram) com a coluna `contact_identity` (telefone ou handle do Instagram).
- Renomear/criar a tabela de eventos de webhook para `inbound_webhook_events` genérica para auditoria de payloads da Meta (WhatsApp e Instagram).
- Criar a tabela `google_places_cache` para armazenamento temporário de leads frios antes da ativação.
- Atualizar a Edge Function local para processar mensagens de ambos os canais de forma integrada.
- Conectar o service de CRM do frontend (`crmService.js`) à tabela unificada de conversas.

---

## Alterações de Arquivos

### 1. [20260602000000_consolidate_conversations_and_cache.sql](file:///c:/Users/User/OneDrive/Área de Trabalho/Plano Certo/supabase/migrations/20260602000000_consolidate_conversations_and_cache.sql) [NEW]
Migration SQL para aplicar:
- Criação/alteração da tabela `conversations` com `contact_identity` (text), `assigned_to_consultant` (boolean), `handoff_at` (timestamptz) e `updated_at` (timestamptz).
- Criação de `inbound_webhook_events` com coluna `channel` (whatsapp/instagram).
- Criação de `google_places_cache` (id, place_id, name, segment, phone, website, city, state, payload, status, created_at).
- Ativação de RLS e concessão de permissões.

### 2. [whatsapp-webhook/index.ts](file:///c:/Users/User/OneDrive/Área de Trabalho/Plano Certo/supabase/functions/whatsapp-webhook/index.ts) [MODIFY]
- Atualizar a lógica do webhook para processar payloads do WhatsApp e do Instagram Direct.
- Substituir inserções em `whatsapp_conversations` por `conversations`.
- Gravar logs brutos em `inbound_webhook_events`.

### 3. [crmService.js](file:///c:/Users/User/OneDrive/Área de Trabalho/Plano Certo/src/services/crmService.js) [MODIFY]
- Alterar as consultas de `from('whatsapp_conversations')` para `from('conversations')`.
- Mapear a coluna `contact_identity` para o telefone/perfil correspondente no frontend.

---

## Passos de Execução

1. **Escrever a Migration SQL**: Criar a nova migration contendo as DDLs.
2. **Atualizar a Edge Function**: Modificar o arquivo typescript do webhook para suportar a nova tabela consolidada e payloads do Instagram.
3. **Refatorar o Service Frontend**: Atualizar as chamadas de API no arquivo `crmService.js` para garantir compatibilidade.
4. **Validar Localmente**: Executar a build e verificar se o schema local passa nos smoke tests.

---

## Plano de Verificação

### Testes de Compilação e Linter
- Compilar a Edge Function localmente: `npx supabase functions download --help` ou apenas rodando o build do frontend para confirmar que o service do React está correto.
- Executar `npm run build` do frontend.

### Orientação ao Usuário
- Como as conexões diretas de rede a bancos externos (`errbmfumiixmyjiltdtq.supabase.co`) são bloqueadas na sandbox da IA por questões de segurança, forneceremos todas as queries de migration prontas.
- O usuário executará a migration na console do Supabase (SQL Editor) ou através da CLI local:
  ```bash
  npx supabase db push
  ```
