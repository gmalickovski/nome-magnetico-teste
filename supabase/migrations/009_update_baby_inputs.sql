-- ================================================================
-- Nome Magnético — Migration: 009_update_baby_inputs
-- Adicionando campos específicos para pai, mãe e outros sobrenomes
-- ================================================================

ALTER TABLE public.baby_name_inputs
  ADD COLUMN IF NOT EXISTS sobrenome_pai TEXT,
  ADD COLUMN IF NOT EXISTS ignorar_pai BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sobrenome_mae TEXT,
  ADD COLUMN IF NOT EXISTS ignorar_mae BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS outros_sobrenomes TEXT[] DEFAULT '{}';

ALTER TABLE public.baby_name_inputs
  ALTER COLUMN sobrenome_familia DROP NOT NULL;
