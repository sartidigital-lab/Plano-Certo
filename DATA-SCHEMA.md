# Plano Certo - Data schema e contratos de agentes

Este documento descreve a estrutura alvo para trocar os mocks atuais por Supabase/API sem reescrever o frontend.

## Domínios

- CRM: empresas, contatos, leads, oportunidades e atividades.
- Conversas: canais, mensagens, consentimento e handoff humano.
- Conhecimento comercial: catálogo de planos, tabelas de preço e regras de elegibilidade.
- Conhecimento regulatório: documentos ANS, chunks citáveis e revisões.
- Agentes: perfis, permissões, runs, tarefas e aprovações humanas.

## Tabelas CRM

### companies
- id
- legal_name
- trade_name
- segment
- city
- state
- estimated_lives
- current_provider
- source
- created_at
- updated_at

### contacts
- id
- company_id
- name
- role
- phone
- email
- whatsapp_opt_in
- opt_out_at
- created_at
- updated_at

### leads
- id
- company_id
- primary_contact_id
- origin_channel
- score
- status
- pain_summary
- next_action
- assigned_user_id
- created_at
- updated_at

### opportunities
- id
- lead_id
- stage
- expected_lives
- expected_premium
- close_probability
- next_follow_up_at
- created_at
- updated_at

## Conversas

### conversations
- id
- lead_id
- channel
- status
- assigned_agent_id
- assigned_user_id
- last_message_at
- created_at

### messages
- id
- conversation_id
- sender_type: lead | agent | user | system
- sender_id
- body
- metadata
- risk_level
- requires_approval
- approved_by
- approved_at
- sent_at
- created_at

## Catálogo, elegibilidade e handoff comercial

Decisão de fluxo em 2026-05-17:
- O agente não calcula nem promete preço final por operadora, UF ou região.
- O agente classifica o lead, identifica UF/região, quantidade de vidas, perfil da empresa e urgência.
- O agente sugere caminhos possíveis de atendimento com base em catálogo, elegibilidade e sinais comerciais.
- O agente encaminha o lead ao corretor humano com um resumo pronto para ação.
- Tabela por operadora/região deve ser confirmada pelo corretor antes de qualquer proposta ao cliente.
- `price_tables` e `price_table_rows` ficam como base interna em validação, não como fonte final de cotação automática.

### operators
- id
- name
- ans_code
- status

### administrators
- id
- name
- status

### health_plans
- id
- operator_id
- administrator_id
- product_name
- ans_register
- segment
- contract_type
- region_scope
- network_summary
- copay_rule
- eligibility_summary
- status
- confidence_level
- source_document_id
- created_at
- updated_at

### price_tables
- id
- operator_id
- administrator_id
- health_plan_id
- region
- lives_min
- lives_max
- valid_from
- valid_until
- source_file_id
- status: draft | review | active | archived
- approved_by
- approved_at
- created_at

### price_table_rows
- id
- price_table_id
- age_band
- accommodation
- monthly_price
- copay_variant
- notes

## Base ANS

### ans_documents
- id
- title
- source_url
- document_type
- version_label
- published_at
- imported_at
- status

### ans_document_chunks
- id
- ans_document_id
- chunk_index
- heading
- body
- citation_label
- embedding
- created_at

### compliance_rules
- id
- topic
- rule_text
- severity
- required_action
- source_document_id
- status

## Agentes

### agent_profiles
- id
- name
- role
- status
- autonomy_level
- tone_of_voice
- humanization_score
- system_prompt_version
- created_at
- updated_at

### agent_skills
- id
- agent_id
- skill_name
- description
- enabled

### agent_guardrails
- id
- agent_id
- rule_text
- severity
- action: warn | require_approval | block

### agent_runs
- id
- agent_id
- lead_id
- conversation_id
- run_type
- input_payload
- output_payload
- status
- risk_level
- created_at
- completed_at

### human_approvals
- id
- agent_run_id
- lead_id
- proposed_message
- reason
- status: pending | approved | rejected | rewrite_requested
- reviewer_id
- reviewed_at
- created_at

## Contratos de agentes

### Agente de atendimento
Input:
- lead_id
- conversation_history
- known_company_context
- allowed_topics

Output:
- reply_draft
- extracted_fields
- confidence
- requires_human
- handoff_summary

### Agente outbound
Input:
- company_context
- public_signal
- channel
- cadence_step
- opt_in_status

Output:
- message_draft
- personalization_reason
- risk_level
- requires_approval
- next_follow_up_at

### Agente de triagem e handoff comercial
Input:
- lead_profile
- uf_region
- lives
- company_profile
- urgency
- commercial_context

Output:
- lead_classification
- region_and_lives_summary
- suggested_service_paths
- pending_questions
- broker_handoff_summary
- assumptions
- missing_data
- requires_broker_confirmation

### Agente compliance ANS
Input:
- message_draft
- topic
- cited_documents
- commercial_context

Output:
- verdict: pass | warn | block
- reasons
- required_edits
- citations
- reviewer_note

## Princípios de implementação

- O agente nunca calcula, promete ou envia preço final por operadora/região.
- Tabelas por UF/região são referência interna em validação e devem ser confirmadas pelo corretor humano.
- O agente deve encaminhar lead qualificado ao corretor com resumo, urgência, região, vidas estimadas e perguntas pendentes.
- O agente nunca responde cobertura, carência, reajuste ou registro sem citação da Base ANS.
- Toda mensagem outbound precisa de origem do dado, justificativa e status de consentimento.
- Toda resposta com promessa comercial deve passar por aprovação humana.
- Mocks atuais devem ser substituídos dentro de `src/services/`, mantendo as páginas estáveis.
