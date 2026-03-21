-- ================================================================
-- Nome Magnético — Expandir analyses para suportar
-- 4 triângulos, lições cármicas, tendências ocultas e produtos.
-- Migration: 002_expand_analyses
-- ================================================================

-- Novos campos na tabela analyses
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS triangulo_pessoal   JSONB,
  ADD COLUMN IF NOT EXISTS triangulo_social     JSONB,
  ADD COLUMN IF NOT EXISTS triangulo_destino    JSONB,
  ADD COLUMN IF NOT EXISTS licoes_carmicas      JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS tendencias_ocultas   JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS arcanos_dominantes   JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS frequencias_numeros  JSONB DEFAULT '{}',
  -- Para nome social / resultado harmonizado
  ADD COLUMN IF NOT EXISTS nome_harmonizado     TEXT,
  ADD COLUMN IF NOT EXISTS expressao_harmonizada INTEGER;

-- Renomear triangulo_da_vida → triangulo_vida para consistência
-- (manter o nome antigo como alias via view para não quebrar código legado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'analyses'
      AND column_name = 'triangulo_vida'
  ) THEN
    ALTER TABLE public.analyses
      RENAME COLUMN triangulo_da_vida TO triangulo_vida;
  END IF;
END $$;

-- ================================================================
-- Expandir tabela subscriptions com campos para nome_bebe e nome_empresa
-- ================================================================
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ================================================================
-- Tabela: baby_name_inputs
-- Dados específicos do produto nome_bebe
-- ================================================================
CREATE TABLE IF NOT EXISTS public.baby_name_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Dados dos pais
  nome_pai TEXT,
  nome_mae TEXT,
  sobrenome_familia TEXT NOT NULL,
  -- Data nascimento (real ou prevista)
  data_nascimento_bebe DATE,
  data_prevista DATE,
  -- Preferências
  genero_preferido TEXT CHECK (genero_preferido IN ('masculino', 'feminino', 'neutro', 'surpresa')),
  estilo_preferido TEXT, -- ex: clássico, moderno, espiritual
  nomes_candidatos TEXT[], -- nomes fornecidos pelo usuário para analisar
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.baby_name_inputs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "baby_inputs_own" ON public.baby_name_inputs;
CREATE POLICY "baby_inputs_own" ON public.baby_name_inputs
  FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- Tabela: company_name_inputs
-- Dados específicos do produto nome_empresa
-- ================================================================
CREATE TABLE IF NOT EXISTS public.company_name_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Dados do sócio principal
  nome_socio_principal TEXT NOT NULL,
  data_nascimento_socio DATE,
  -- Dados da empresa
  data_fundacao DATE,
  ramo_atividade TEXT,
  descricao_negocio TEXT,
  -- Nomes candidatos
  nomes_candidatos TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.company_name_inputs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "company_inputs_own" ON public.company_name_inputs;
CREATE POLICY "company_inputs_own" ON public.company_name_inputs
  FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- Índice adicional para busca por produto
-- ================================================================
CREATE INDEX IF NOT EXISTS analyses_product_user_idx
  ON public.analyses(user_id, product_type, created_at DESC);
