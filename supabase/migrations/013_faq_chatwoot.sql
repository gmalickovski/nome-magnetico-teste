-- Migration 013: Suporte a Chatwoot Help Center nas FAQs
-- Adiciona colunas para mapear artigos do Chatwoot Help Center nos faq_items

ALTER TABLE public.faq_items
  ADD COLUMN IF NOT EXISTS chatwoot_article_id  TEXT,
  ADD COLUMN IF NOT EXISTS answer_html          TEXT,           -- HTML rico vindo do Chatwoot
  ADD COLUMN IF NOT EXISTS chatwoot_category_id TEXT,          -- categoria no Chatwoot (para mapeamento)
  ADD COLUMN IF NOT EXISTS slug                 TEXT;           -- slug do artigo

-- Índice único por chatwoot_article_id (quando presente)
CREATE UNIQUE INDEX IF NOT EXISTS faq_items_chatwoot_id_idx
  ON public.faq_items(chatwoot_article_id)
  WHERE chatwoot_article_id IS NOT NULL;

-- Índice para buscas por slug
CREATE INDEX IF NOT EXISTS faq_items_slug_idx
  ON public.faq_items(slug)
  WHERE slug IS NOT NULL;

-- Atualiza trigger de updated_at (se existir) para cobrir as novas colunas
-- (já deve estar configurado via trigger genérico da migration 001)
