# Workflows n8n - Plano Certo

Este diretório guarda especificacoes dos workflows. Depois que o n8n estiver ativo, exportamos os workflows reais para ca.

## 01 - WhatsApp inbound para Supabase

Trigger:
- Webhook n8n ou WhatsApp Business Cloud Trigger.

Etapas:
- Validar payload.
- Registrar evento bruto em `whatsapp_webhook_events`.
- Criar ou localizar conversa em `whatsapp_conversations`.
- Gravar mensagem inbound em `messages`.
- Chamar classificacao do agente quando mensagem trouxer contexto comercial.
- Criar `broker_handoffs` quando houver pedido de preco, rede, operadora, tabela ou urgencia.

Saida:
- Inbox do Plano Certo mostra a conversa.
- Corretor recebe alerta quando o handoff for necessario.

## 02 - Resposta assistida

Trigger:
- Nova mensagem inbound.

Etapas:
- Buscar historico recente no Supabase.
- Gerar sugestao curta de resposta com OpenAI.
- Bloquear sugestoes com preco/tabela/cobertura sem fonte humana.
- Salvar sugestao em `outbound_queue` como `pending`.

Saida:
- Humano aprova antes do envio.

## 03 - Envio WhatsApp aprovado

Trigger:
- `outbound_queue.status = pending` e aprovado por humano.

Etapas:
- Verificar opt-in ou janela de atendimento.
- Enviar via WhatsApp Business Cloud.
- Registrar `external_id`.
- Atualizar status conforme callbacks da Meta.

Saida:
- Historico em `messages`.

## 04 - Google Places discovery

Trigger:
- Manual ou agenda leve.

Etapas:
- Ler nicho, cidade, UF e limite diario.
- Buscar empresas com Places API.
- Deduplicar por `place_id`, telefone e website.
- Salvar cache em `google_places_cache`.
- Criar leads com score inicial.

Saida:
- Leads aparecem no dashboard.

## 05 - Monitoramento

Trigger:
- Agendado, 1x ao dia.

Etapas:
- Contar eventos com erro.
- Contar mensagens falhas.
- Checar volume de chamadas Google/WhatsApp.
- Enviar alerta para email/WhatsApp interno.
