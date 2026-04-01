-- Migration 016: Tabela RAG de embeddings das FAQs
-- Usa pgvector + n8n Supabase Vector Store + OpenAI text-embedding-3-small (1536 dims)
-- Schema compatível com o node nativo @n8n/n8n-nodes-langchain.vectorStoreSupabase

-- ================================================================
-- Extensão pgvector
-- ================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ================================================================
-- Tabela de embeddings
-- Colunas obrigatórias para o n8n: content, metadata, embedding
-- ================================================================

CREATE TABLE IF NOT EXISTS public.faq_embeddings (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_item_id    UUID        NOT NULL UNIQUE REFERENCES public.faq_items(id) ON DELETE CASCADE,
  content        TEXT        NOT NULL,        -- "Pergunta: ...\n\nResposta: ..."
  metadata       JSONB,                       -- { faq_item_id, slug, category_id }
  embedding      vector(1536),               -- OpenAI text-embedding-3-small
  model          TEXT        NOT NULL DEFAULT 'text-embedding-3-small',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- Índice HNSW para busca vetorial (cosine similarity)
-- ================================================================

CREATE INDEX IF NOT EXISTS faq_embeddings_vector_idx
  ON public.faq_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ================================================================
-- RLS
-- ================================================================

ALTER TABLE public.faq_embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "faq_embeddings_service_write" ON public.faq_embeddings;
CREATE POLICY "faq_embeddings_service_write" ON public.faq_embeddings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "faq_embeddings_auth_read" ON public.faq_embeddings;
CREATE POLICY "faq_embeddings_auth_read" ON public.faq_embeddings
  FOR SELECT TO authenticated USING (true);

-- ================================================================
-- Função de busca semântica (assinatura esperada pelo n8n Vector Store)
-- query_embedding, match_count, filter jsonb
-- ================================================================

-- ================================================================
-- Trigger: extrai faq_item_id do metadata JSONB automaticamente
-- O n8n Supabase Vector Store só insere content/metadata/embedding —
-- o trigger preenche faq_item_id para satisfazer o NOT NULL constraint
-- ================================================================

CREATE OR REPLACE FUNCTION public.faq_embeddings_set_faq_item_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.faq_item_id IS NULL AND NEW.metadata IS NOT NULL THEN
    NEW.faq_item_id := (NEW.metadata->>'faq_item_id')::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS faq_embeddings_before_insert ON public.faq_embeddings;

CREATE TRIGGER faq_embeddings_before_insert
  BEFORE INSERT ON public.faq_embeddings
  FOR EACH ROW EXECUTE FUNCTION public.faq_embeddings_set_faq_item_id();

-- ================================================================
-- Função de busca semântica
-- ================================================================

CREATE OR REPLACE FUNCTION public.match_faq_embeddings(
  query_embedding vector(1536),
  match_count     int     DEFAULT 5,
  filter          jsonb   DEFAULT '{}'
)
RETURNS TABLE (
  id          uuid,
  content     text,
  metadata    jsonb,
  similarity  float
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.content,
    e.metadata,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.faq_embeddings e
  INNER JOIN public.faq_items i ON i.id = e.faq_item_id AND i.is_active = true
  WHERE e.metadata @> filter
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
