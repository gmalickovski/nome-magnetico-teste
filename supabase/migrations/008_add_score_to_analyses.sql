-- Adiciona coluna score à tabela analyses
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score >= 0 AND score <= 100);
