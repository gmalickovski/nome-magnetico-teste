-- ============================================================
-- 021_blog_glossary.sql
-- Tabelas para Blog e Glossário público do Nome Magnético
-- Gerenciadas via Claude Desktop + Supabase MCP
-- e via HQ Studio MLK (editor UI)
-- ============================================================

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT        UNIQUE NOT NULL,
  title               TEXT        NOT NULL,
  description         TEXT,
  content_markdown    TEXT        NOT NULL DEFAULT '',
  produto_relacionado TEXT        CHECK (produto_relacionado IN ('nome_social','nome_bebe','nome_empresa')),
  author              TEXT        DEFAULT 'Nome Magnético',
  cover_image_url     TEXT,
  meta_title          TEXT,
  meta_description    TEXT,
  meta_tags           TEXT[],
  is_published        BOOLEAN     NOT NULL DEFAULT FALSE,
  published_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GLOSSARY TERMS
CREATE TABLE IF NOT EXISTS public.glossary_terms (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 TEXT        UNIQUE NOT NULL,
  term                 TEXT        NOT NULL,
  definition_markdown  TEXT        NOT NULL DEFAULT '',
  related_number       INTEGER     CHECK (related_number BETWEEN 1 AND 22),
  tags                 TEXT[],
  meta_title           TEXT,
  meta_description     TEXT,
  is_published         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.blog_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- Recriar policies idempotente
DROP POLICY IF EXISTS "blog_public_read"     ON public.blog_posts;
DROP POLICY IF EXISTS "blog_service_all"     ON public.blog_posts;
DROP POLICY IF EXISTS "glossary_public_read" ON public.glossary_terms;
DROP POLICY IF EXISTS "glossary_service_all" ON public.glossary_terms;

-- Leitura pública: apenas conteúdo publicado (site serve isso)
CREATE POLICY "blog_public_read"
  ON public.blog_posts FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "glossary_public_read"
  ON public.glossary_terms FOR SELECT
  USING (is_published = TRUE);

-- Service role acessa tudo (Claude Desktop MCP + server-side API)
CREATE POLICY "blog_service_all"
  ON public.blog_posts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "glossary_service_all"
  ON public.glossary_terms FOR ALL
  USING (auth.role() = 'service_role');

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug        ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published   ON public.blog_posts (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_produto     ON public.blog_posts (produto_relacionado);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_slug    ON public.glossary_terms (slug);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_term    ON public.glossary_terms (term);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_number  ON public.glossary_terms (related_number);
