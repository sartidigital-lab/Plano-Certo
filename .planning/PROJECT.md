# Plano Certo - Project Context

Este documento define a visão técnica e os princípios de design do redesenho do **Plano Certo**.

## Visão Geral do Projeto
O Plano Certo é um CRM de seguros de saúde focado na automatização de prospecção, qualificação e atendimento inicial (triagem), com passagem inteligente dos leads qualificados para corretores humanos.

## Princípios de Design (Aesthetics System)
1. **Premium Glassmorphism**:
   - Cartões, modais e menus flutuantes usam `background: rgba(255, 255, 255, 0.05)` (ou `rgba(15, 23, 42, 0.65)` para dark mode).
   - Efeito de desfoque: `backdrop-filter: blur(12px) saturate(180%)`.
   - Borda sutil de 1px semitransparente: `border: 1px solid rgba(255, 255, 255, 0.08)`.
2. **Cores Harmoniosas**:
   - Cores neutras profundas baseadas em slate/zinc para dark mode.
   - Destaques de ação usando gradientes sutis em HSL (ex: azul safira a roxo ametista).
   - Sem cores puras agressivas (vermelho/verde/azul puros).
3. **Micro-Animações**:
   - Transições de hover em botões e links (`transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`).
   - Indicadores de atividade discretos para agentes em execução.
   - Animação de entrada suave para novas mensagens no painel da caixa de entrada.

## Stack Tecnológica
- **Frontend**: React 19 + Vite 7 (Single Page Application).
- **Estilização**: Vanilla CSS customizado (sem Tailwind).
- **Backend & Banco**: Supabase (Database, Auth, Edge Functions, RLS, Vector Extension).
- **Automação**: n8n self-hosted para processamento em segundo plano e cron jobs.
- **Canais**: WhatsApp Business Cloud API e Instagram Direct Messages (via Meta).
- **Modelos de IA**: OpenAI API para RAG de conhecimento regulatório (ANS) e catalogo comercial.

## Estrutura Operacional
- **Escopo Inicial**: Single Tenant (Conta central "Dono").
- **Agentes**:
  - Inbound: Agente autônomo respondendo a dúvidas com base na Base ANS e catálogo.
  - Outbound (Campanhas e Prospecção): n8n encontra empresas via Google Places, registra no cache, sugere abordagens, e aguarda aprovação humana antes de enviar.

## Estado Atual do Repositório
- **Versão Entregue**: v1.0 (Redesenho do CRM Plano Certo).
- **Entregas Principais**: Design system glassmorphism, Schema Supabase unificado, Webhooks multicanal em TS, Busca vetorial RAG (pgvector) de base ANS e Integração de painéis do corretor em tempo real.

## Metas do Próximo Marco (Prospecção Inteligente & Multi-tenancy)
1. **Multi-tenancy Avançado**: Isolamento de dados por corretora (injeção e validação do `organization_id` em todas as tabelas via RLS).
2. **Dashboard de Campanhas Outbound**: Relatórios de performance e taxa de conversão das abordagens por canal em tempo real.

