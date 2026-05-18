# Plano Certo - Escopo de integracoes para agentes

## Objetivo

Automatizar prospeccao, qualificacao, conversa inicial e handoff para corretor com baixo custo, usando Google e WhatsApp como canais principais.

O agente nao deve prometer preco, tabela regional, reducao de reajuste ou cobertura. O papel dele e encontrar/receber leads, classificar, coletar contexto, sugerir caminhos e encaminhar para o corretor humano.

## Principio de baixo custo

- Preferir APIs oficiais diretas antes de contratar plataformas intermediarias.
- Comecar com volume controlado, cache e limites diarios.
- Usar dados minimos necessarios em cada chamada paga.
- Persistir tudo no Supabase para evitar depender de ferramentas caras de CRM no inicio.
- Separar automacao assistida de envio em massa.

## Google

### Necessario

- Google Maps Platform Places API para descobrir empresas por nicho, cidade, UF e termos como `clinica`, `restaurante`, `industria`, `escritorio`, `academia`.
- Place Details apenas quando um lead for promissor, usando field masks para buscar somente campos necessarios.
- Quotas e alertas de billing no Google Cloud.
- Tabela `scrape_jobs` para registrar buscas, status, filtros e volume encontrado.
- Tabela `leads` para salvar empresas deduplicadas.

### Dados minimos por lead

- Nome da empresa.
- Segmento pesquisado.
- Cidade/UF/regiao.
- Telefone publico quando disponivel.
- Website quando disponivel.
- Endereco ou bairro.
- Origem `Google/Maps`.
- Score inicial.
- Tags de contexto.

### Regras de custo

- Rodar buscas por lotes pequenos.
- Evitar chamadas repetidas para o mesmo `place_id`.
- Cachear resultados por `place_id`.
- Buscar detalhes so depois de uma primeira classificacao.
- Comecar com uma rotina manual/assistida antes de cron automatico.

## WhatsApp

### Caminho recomendado

Usar WhatsApp Business Platform Cloud API diretamente pela Meta para reduzir custo de plataforma e manter controle tecnico.

### Necessario

- Meta Business Manager.
- WhatsApp Business Account.
- Numero dedicado ou numero com coexistencia quando aplicavel.
- App Meta configurado com Cloud API.
- Webhook publico para mensagens recebidas, status de entrega e erros.
- Templates aprovados para mensagens iniciadas pela empresa.
- Politica de opt-out e registro de consentimento.

### Dados minimos no banco

- `whatsapp_conversations`: conversa por lead/telefone.
- `messages`: historico inbound/outbound, canal, status e origem.
- `agent_sessions`: estado do atendimento do agente.
- `outbound_queue`: fila de mensagens aprovadas.
- `message_templates`: templates permitidos e categoria.
- Futuro: `broker_handoffs` para repasses ao corretor.

### Regras de seguranca comercial

- Nao disparar mensagem em massa sem opt-in ou justificativa comercial clara.
- Diferenciar resposta dentro da janela de atendimento de template iniciado pela empresa.
- Guardar status: sent, delivered, read, failed.
- Guardar motivo de handoff humano.
- Bloquear mensagem com preco/tabela sem revisao humana.

## Orquestracao dos agentes

### MVP baixo custo

- Supabase Database para estado e historico.
- Supabase Edge Functions para webhooks e endpoints privados.
- Supabase Cron ou GitHub Actions agendado para rotinas leves.
- Vercel para frontend.
- OpenAI API somente nos pontos de valor: classificacao, resumo, sugestao de abordagem e handoff.

### Fluxos

1. Descoberta Google
   - Busca por nicho + regiao.
   - Deduplica por telefone/site/place_id.
   - Cria lead com score inicial.

2. Classificacao
   - Agente avalia segmento, regiao, porte estimado, canal e sinais.
   - Define prioridade: alta, media, nutrir.
   - Gera perguntas pendentes.

3. WhatsApp assistido
   - Agente sugere abordagem.
   - Humano aprova ou ajusta.
   - Sistema envia pela Cloud API quando permitido.

4. Atendimento inbound
   - Webhook recebe mensagem.
   - Agente resume e responde somente dentro das regras.
   - Quando houver preco, rede, cobertura ou tabela regional, gera handoff.

5. Handoff para corretor
   - Resumo com empresa, UF/regiao, vidas, urgencia, dor, origem, perguntas pendentes e restricoes.
   - Corretor confirma tabela por operadora/regiao e conduz proposta.

## Ferramentas opcionais

- n8n self-hosted para prototipos internos de automacao, se quisermos montar fluxos rapidamente sem escrever tudo em Edge Functions.
- Google Sheets apenas como painel operacional temporario, nao como fonte definitiva.
- Sentry ou Logtail/Axiom depois que houver volume real de mensagens.
- Provedor BSP de WhatsApp somente se a Cloud API direta virar gargalo operacional.

## Fora do escopo inicial

- Envio massivo de marketing.
- Cotacao automatica final.
- Scraping fora das regras de uso das fontes.
- Browser automation de WhatsApp Web para cliente final.
- Compra de bases frias sem consentimento/qualificacao.

## Proximas implementacoes no produto

1. Criar `broker_handoffs`.
2. Persistir handoff gerado pela tela `/handoff`.
3. Conectar Inbox a `whatsapp_conversations` e `messages`.
4. Criar endpoint webhook para WhatsApp Cloud API.
5. Criar importador Google Places com limite diario e cache.
6. Criar painel de campanhas assistidas, nao disparo automatico irrestrito.
7. Adicionar trilha de auditoria para toda decisao do agente.
