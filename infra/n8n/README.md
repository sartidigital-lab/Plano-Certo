# Plano Certo - n8n na VPS

## Objetivo

Subir um n8n self-hosted para orquestrar WhatsApp, Google, Supabase e agentes sem depender de plataformas caras no inicio.

## Quando usar este ambiente

- Use este compose se contratarmos uma VPS limpa ou Hostinger VPS com Docker.
- Se usarmos o template n8n pronto da Hostinger, mantenha este diretório como referencia de variaveis, seguranca e workflows.

## Passos na VPS

```bash
mkdir -p /opt/plano-certo/n8n
cd /opt/plano-certo/n8n
```

Copiar estes arquivos para a VPS:

```text
infra/n8n/docker-compose.yml
infra/n8n/Caddyfile
infra/n8n/.env.example
```

Criar `.env` a partir do exemplo:

```bash
cp .env.example .env
nano .env
```

Subir:

```bash
docker compose up -d
docker compose logs -f n8n
```

Verificar:

```bash
docker compose ps
curl -I https://automacoes.seudominio.com.br
```

## DNS

Criar um registro `A`:

```text
automacoes.seudominio.com.br -> IP_PUBLICO_DA_VPS
```

O Caddy emite HTTPS automaticamente quando DNS e portas 80/443 estiverem corretos.

## Backups minimos

Manter backup dos volumes:

- `postgres_data`
- `n8n_data`

Rotina recomendada inicial: snapshot diario da VPS no provedor e export manual dos workflows a cada alteracao importante.

## Hardening inicial

- Usar senha forte em `N8N_BASIC_AUTH_PASSWORD`.
- Usar `N8N_ENCRYPTION_KEY` fixo e forte desde o primeiro deploy.
- Nunca colocar `SUPABASE_SERVICE_ROLE_KEY` no frontend.
- Restringir acesso SSH por chave.
- Atualizar sistema operacional antes de subir Docker.
- Guardar tokens Meta/OpenAI/Google apenas no `.env` da VPS ou credenciais internas do n8n.

## Workflows MVP

Os workflows devem ser criados nesta ordem:

1. WhatsApp inbound para Supabase.
2. Classificacao e resumo do lead.
3. Handoff para corretor.
4. Campanha assistida Google Places.
5. Monitoramento de erros e custos.
