-- Plano Certo - Vector similarity search RPC for RAG
-- Ensures pgvector is enabled, RAG tables exist, and creates the matching RPC function.

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Ensure ans_documents table exists
create table if not exists public.ans_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_url text,
  document_type text,
  version_label text,
  published_at date,
  imported_at timestamptz not null default now(),
  status text not null default 'active'
);

-- 3. Ensure ans_document_chunks table exists
create table if not exists public.ans_document_chunks (
  id uuid primary key default gen_random_uuid(),
  ans_document_id uuid references public.ans_documents(id) on delete cascade,
  chunk_index integer not null,
  heading text,
  body text not null,
  citation_label text,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

-- 4. Create RPC function
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

-- Allow anonymous and authenticated access to the matching function
grant execute on function public.match_document_chunks(vector(1536), float, int) to anon, authenticated;
