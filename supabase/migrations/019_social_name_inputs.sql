-- ================================================================
-- Nome Magnético — Migration: 019_social_name_inputs
-- Tabela de inputs do formulário do produto Nome Social (novo fluxo)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.social_name_inputs (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id            UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Dados base (âncora numerológica)
  nome_nascimento        TEXT NOT NULL,
  data_nascimento        DATE NOT NULL,
  -- Intenção e contexto
  objetivo_apresentacao  TEXT,
  vibracoes_desejadas    TEXT,
  contexto_uso           TEXT,
  estilo_preferido       TEXT,
  genero                 TEXT,
  -- Nomes candidatos fornecidos pelo usuário
  nomes_candidatos       TEXT[] DEFAULT '{}',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.social_name_inputs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social_inputs_own" ON public.social_name_inputs;
CREATE POLICY "social_inputs_own" ON public.social_name_inputs
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS social_name_inputs_analysis_idx
  ON public.social_name_inputs(analysis_id);
