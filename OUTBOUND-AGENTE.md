# Plano Certo - Estrutura do agente outbound

## Objetivo

Criar uma operacao outbound assistida por agente para encontrar empresas no Google, qualificar sinais comerciais e preparar abordagens por WhatsApp com revisao humana, rastreabilidade e passagem clara para o corretor.

## Canais

- Google: fonte principal de descoberta. Usar Google Business, sites publicos, mapas, avaliacoes, telefone publico, cidade, segmento e sinais de crescimento.
- WhatsApp: canal de primeira conversa e follow-up curto. O agente sugere mensagens, registra contexto e respeita opt-out.
- Inbox/Pipeline: destino operacional das respostas, com resumo, score, objeções e proxima acao para o corretor.

## Fluxo operacional

1. Descoberta no Google
   - Entrada: segmento, cidade, raio, ticket esperado, operadoras/regioes de interesse.
   - Saida: lista de empresas com nome, segmento, cidade, site, telefone publico, fonte e observacoes.

2. Enriquecimento
   - Estimar porte por sinais publicos: equipe no site, unidades, vagas, fotos, redes sociais, CNPJ quando disponivel.
   - Identificar dor provavel: reajuste, rede credenciada, primeira contratacao PJ, expansao, troca de operadora.
   - Gerar score combinando fit, urgencia, confianca dos dados e facilidade de contato.

3. Abordagem WhatsApp
   - Mensagem curta, personalizada e consultiva.
   - Primeiro toque deve pedir permissao e oferecer valor objetivo.
   - Sequencia padrao: D0 permissao + contexto, D2 insight util, D5 encerramento elegante.

4. Resposta e repasse
   - Se houver interesse: coletar vidas, cidade, operadora atual, rede desejada, vencimento/reajuste e decisor.
   - Encaminhar ao corretor com resumo, historico, score e proxima acao.
   - Se houver negativa ou pedido de remocao: interromper sequencia e registrar opt-out.

## Guardrails

- Registrar fonte publica e motivo comercial do contato.
- Nao prometer preco, reducao de custo ou cobertura sem cotacao real.
- Nao automatizar disparos em massa sem base permitida, opt-in, contrato de mensageria adequado ou aprovacao humana.
- Limitar cadencia para evitar experiencia invasiva.
- Preservar historico de consentimento, negativas e origem do dado.

## Dados minimos do lead outbound

- Empresa
- Segmento
- Cidade/UF
- Fonte Google
- Telefone publico
- Site ou perfil publico
- Porte estimado em vidas
- Sinal comercial observado
- Score
- Status da sequencia
- Responsavel humano
- Consentimento/opt-out

## MVP recomendado

1. Tela de outbound com lista Google triada, gerador de abordagem e aprovacao humana.
2. Cadastro manual/importado de empresas encontradas no Google.
3. Geracao de mensagem consultiva por canal.
4. Sequencia WhatsApp controlada por status, ainda sem disparo automatico.
5. Repasse para Inbox/Pipeline quando o lead responde ou atinge score minimo.
