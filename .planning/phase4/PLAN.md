# Plano Certo - Phase 4 Execution Plan (Integração de Frontend & Caixa de Entrada)

Este plano detalha a integração do frontend em React 19 aos endpoints reais do Supabase para Caixa de Entrada (Inbox) em Tempo Real, Painel de Prospecção do Google Places e Fila de Revisão Humana.

## Objetivos da Fase
- **Realtime Messages Subscription**: Atualizar a tela `Inbox.jsx` para escutar novos registros na tabela `messages` em tempo real para a conversa selecionada.
- **Integração do Cache do Google Places**: Modificar a tela `Outbound.jsx` para buscar registros reais de `google_places_cache`, permitindo filtragem por segmento e cidade, descarte (status = `rejected`) ou conversão (status = `converted` e criação de Lead/Conversa).
- **Integração da Fila de Aprovação Humana**: Ajustar o console de agentes `AgentConsole.jsx` para ler pendências de `human_approvals` diretamente do Supabase, permitindo aprovação ou rejeição que atualizam o banco em tempo real.

---

## Alterações de Arquivos Propostas

### 1. [crmService.js](file:///C:/Users/User/OneDrive/Área de Trabalho/Plano Certo/src/services/crmService.js) [MODIFY]
- Adicionar função `fetchProspects()` para obter dados da tabela `google_places_cache`.
- Adicionar função `updateProspectStatus(id, status)` para atualizar o status do prospect para `rejected` ou `converted`.
- Adicionar função `convertProspectToLead(prospect)` que realiza os seguintes inserts de forma transacional ou sequencial:
  1. Cria uma linha na tabela `companies` com nome, segmento, cidade, estado, telefone, website.
  2. Cria uma linha na tabela `contacts` com telefone da empresa.
  3. Cria uma linha na tabela `leads` com origem 'Google Places', score = 70.
  4. Cria uma linha na tabela `conversations` vinculada ao lead com canal 'whatsapp' e `contact_identity`.
  5. Atualiza o status do prospect para `converted`.

### 2. [agentService.js](file:///C:/Users/User/OneDrive/Área de Trabalho/Plano Certo/src/services/agentService.js) [MODIFY]
- Adicionar função `fetchPendingApprovals()` para obter registros da tabela `human_approvals` unida aos dados de `leads` (com `companies` e `contacts`) e `agent_runs` (com `agent_profiles`).
- Adicionar função `updateApprovalStatus(id, status)` para atualizar a situação da aprovação no banco.

### 3. [Inbox.jsx](file:///C:/Users/User/OneDrive/Área de Trabalho/Plano Certo/src/pages/Inbox.jsx) [MODIFY]
- Importar `supabase` de `src/lib/supabaseClient.js`.
- Configurar assinatura com `supabase.channel().on('postgres_changes', ...)` filtrada pelo `activeConversationId` selecionado.
- Atualizar a lista de mensagens local dinamicamente a cada novo evento `INSERT`.
- Garantir desativação e cleanup do canal de realtime ao desmontar o componente ou trocar de conversa ativa.

### 4. [Outbound.jsx](file:///C:/Users/User/OneDrive/Área de Trabalho/Plano Certo/src/pages/Outbound.jsx) [MODIFY]
- Carregar dados reais da tabela `google_places_cache` na inicialização da página.
- Disponibilizar barra de busca e filtros para o corretor segmentar por cidade e nicho de prospecção.
- Substituir o componente `LeadTriageCard` mockado para ler dados reais e expor botões interativos de "Descartar" e "Converter em Lead".

### 5. [AgentConsole.jsx](file:///C:/Users/User/OneDrive/Área de Trabalho/Plano Certo/src/pages/AgentConsole.jsx) [MODIFY]
- Conectar a fila de aprovação à tabela `human_approvals` chamando `fetchPendingApprovals()` e atualizando o status via `updateApprovalStatus()`.

---

## Passos de Execução

1. **Ajustes nos Services**: Estender `crmService.js` e `agentService.js` com os novos métodos de busca e modificação no Supabase.
2. **Integração Realtime no Inbox**: Adicionar canal de subscrição no `Inbox.jsx`.
3. **Refatoração do Outbound**: Ajustar a tela `Outbound.jsx` e o card `LeadTriageCard` para listar, filtrar e processar prospects reais.
4. **Refatoração do AgentConsole**: Mapear a fila de aprovação real nos cards de revisão no `AgentConsole.jsx`.
5. **Validação local**: Rodar `npm run dev` e buildar localmente para checar compatibilidade de tipos e build do React.

---

## Plano de Verificação

### Testes Manuais de Interface (com Mocks/Supabase)
- Abrir a aplicação e verificar se a conexão com o Supabase é estabelecida.
- Simular a inserção de uma mensagem no banco e verificar se ela aparece na tela do Inbox sem recarregar a página.
- Validar se o filtro por cidade e segmento funciona na aba Outbound.
- Aprovar um prospect na aba Outbound e verificar se ele é inserido no pipeline de Leads.
- Concluir revisões na fila do AgentConsole e verificar se o status de aprovação é modificado no banco.
