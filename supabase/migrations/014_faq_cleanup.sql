-- Migration 014: Limpeza da tabela faq_items
-- - Renomeia `answer` para `answer_markdown` (markdown é a fonte)
-- - Remove `answer_html` (gerado em runtime via marked)
-- - Remove `chatwoot_category_id` (redundante com category_id FK)
-- - Adiciona `is_featured` para destacar FAQs na landing page
-- - Adiciona unique constraint em slug para upserts seguros

-- Renomear answer → answer_markdown
ALTER TABLE public.faq_items RENAME COLUMN answer TO answer_markdown;

-- Remover colunas obsoletas
ALTER TABLE public.faq_items
  DROP COLUMN IF EXISTS answer_html,
  DROP COLUMN IF EXISTS chatwoot_category_id;

-- Adicionar coluna is_featured
ALTER TABLE public.faq_items
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Adicionar unique constraint em slug (permite ON CONFLICT na migration 015)
ALTER TABLE public.faq_items
  DROP CONSTRAINT IF EXISTS faq_items_slug_unique;
ALTER TABLE public.faq_items
  ADD CONSTRAINT faq_items_slug_unique UNIQUE (slug);

-- Remover índice de slug (coberto pela constraint acima)
DROP INDEX IF EXISTS faq_items_slug_idx;
