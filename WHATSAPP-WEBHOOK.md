# Plano Certo - WhatsApp Cloud API webhook

## Objetivo

Receber eventos da Meta WhatsApp Cloud API, registrar payload bruto, criar ou reutilizar conversa em `whatsapp_conversations` e gravar mensagens recebidas em `messages`.

## Endpoint

Depois do deploy da Edge Function:

```text
https://errbmfumiixmyjiltdtq.functions.supabase.co/whatsapp-webhook
```

## Segredos necessarios

```bash
WHATSAPP_VERIFY_TOKEN=<token escolhido por nos e configurado na Meta>
WHATSAPP_APP_SECRET=<app secret da Meta para validar x-hub-signature-256>
SUPABASE_URL=https://errbmfumiixmyjiltdtq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role somente no backend>
```

## Comportamento

- `GET`: valida `hub.mode`, `hub.verify_token` e devolve `hub.challenge`.
- `POST`: valida assinatura quando `WHATSAPP_APP_SECRET` estiver configurado.
- Registra cada change em `whatsapp_webhook_events`.
- Cria conversa por telefone quando ainda nao existir.
- Grava mensagem inbound em `messages`.
- Atualiza status de mensagens por `external_id` quando a Meta enviar `statuses`.

## Publicacao

A CLI do Supabase esta instalada como dependencia de desenvolvimento do projeto. Antes do primeiro deploy, autenticar:

```bash
npm run supabase:login
```

Depois configurar os segredos:

```bash
npx supabase secrets set WHATSAPP_VERIFY_TOKEN=... WHATSAPP_APP_SECRET=... --project-ref errbmfumiixmyjiltdtq
```

Publicar a funcao:

```bash
npm run supabase:deploy:whatsapp
```

No painel da Meta, configurar o callback para a URL da Edge Function e usar o mesmo `WHATSAPP_VERIFY_TOKEN`.

## Proximos cuidados

- Trocar policies publicas temporarias por RLS autenticado por organizacao antes de uso real multi-tenant.
- Definir se mensagens de resposta saem direto pela Cloud API ou entram em fila `outbound_queue`.
- Criar tela de monitoramento para `whatsapp_webhook_events` com filtros de erro.
