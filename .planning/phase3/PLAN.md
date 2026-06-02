# Plano Certo - Phase 3 Execution Plan (RAG & Automação dos Agentes)

Este plano descreve as etapas para implementar a base de RAG (Busca Semântica na Base ANS) e as regras de orquestração de agentes autônomos e assistidos.

## Objetivos da Fase
- Habilitar busca por similaridade vetorial no Supabase através da criação da RPC `match_document_chunks`.
- Definir os prompts dos agentes de triagem (outbound) e atendimento (inbound RAG).
- Especificar a lógica do fluxo de campanhas outbound assistidas (com aprovação humana) e atendimento automático inbound (sem intervenção se houver alta confiança e citação da base ANS).
- Preparar especificações de fluxos do n8n na pasta `infra/n8n/workflows/`.

---

## Alterações de Arquivos

### 1. [20260602001000_create_rag_rpc.sql](file:///c:/Users/User/OneDrive/Área de Trabalho/Plano Certo/supabase/migrations/20260602001000_create_rag_rpc.sql) [NEW]
Migration SQL para criar a função de busca vetorial:
```sql
create or replace function public.match_document_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  ans_document_id uuid,
  chunk_index int,
  heading text,
  body text,
  citation_label text,
  similarity float
)
language sql stable
as $$
  select
    adc.id,
    adc.ans_document_id,
    adc.chunk_index,
    adc.heading,
    adc.body,
    adc.citation_label,
    1 - (adc.embedding <=> query_embedding) as similarity
  from public.ans_document_chunks adc
  where 1 - (adc.embedding <=> query_embedding) > match_threshold
  order by adc.embedding <=> query_embedding
  limit match_count;
$$;
```

### 2. [AGENTS-PROMPTS.md](file:///c:/Users/User/OneDrive/Área de Trabalho/Plano Certo/.planning/phase3/AGENTS-PROMPTS.md) [NEW]
Documento com as especificações de prompts do sistema:
- **Agente de Atendimento Inbound (RAG)**: Instruções estritas de não prometer preço, usar chunks da base ANS, recusar cotações automáticas e gerar handoffs.
- **Agente de Qualificação e Triagem**: Como gerar o score do lead (Fit comercial) e formatar o resumo comercial para o corretor.
- **Agente de Abordagem Outbound**: Geração de sugestão de mensagens curtas de abordagem por WhatsApp/Instagram.

### 3. [n8n workflows json](file:///c:/Users/User/OneDrive/Área de Trabalho/Plano Certo/infra/n8n/workflows/) [NEW]
- Adicionar definições JSON dos fluxos 01, 02 e 03 do n8n para importar na console do n8n.

---

## Passos de Execução

1. **Escrever a Migration SQL da RPC**: Criar a nova migration do Supabase com a função de busca vetorial.
2. **Documentar Prompts de Agentes**: Criar [AGENTS-PROMPTS.md](file:///c:/Users/User/OneDrive/Área de Trabalho/Plano Certo/.planning/phase3/AGENTS-PROMPTS.md).
3. **Gerar JSONs de Workflows n8n**: Criar os arquivos JSON correspondentes aos fluxos de automação na pasta `infra/n8n/workflows/`.
4. **Atualizar o Estado**: Marcar a Fase 3 como planejada no `STATE.md`.

---

## Plano de Verificação

### Testes de Banco de Dados
- Validar se a função RPC é criada corretamente sem erros de sintaxe SQL.

### Testes de Frontend
- Rodar `npm run build` para garantir que nenhuma alteração nos arquivos de configuração ou backend afete o client React.
