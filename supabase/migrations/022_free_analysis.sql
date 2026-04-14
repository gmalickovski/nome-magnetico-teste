-- Adiciona campo is_free para marcar análises gratuitas (uma por usuário)
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT FALSE;

-- Index para checar rapidamente se usuário já usou a análise gratuita
CREATE INDEX IF NOT EXISTS idx_analyses_user_free
  ON public.analyses (user_id, is_free)
  WHERE is_free = TRUE;
