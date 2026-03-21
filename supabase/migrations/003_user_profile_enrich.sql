-- ================================================================
-- Nome Magnético — Enriquecimento do perfil de usuário
-- Migration: 003_user_profile_enrich
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Campos adicionais na tabela profiles
-- ----------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone        TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url   TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- ----------------------------------------------------------------
-- 2. View consolidada: user_status
--    Une profiles + subscription ativa mais recente.
--    Usada em: painel admin, middleware de acesso, dashboard.
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW public.user_status AS
SELECT
  p.id,
  p.email,
  p.nome,
  p.phone,
  p.avatar_url,
  p.role,
  p.app_source,
  p.last_login_at,
  p.created_at,
  p.updated_at,
  -- Plano ativo
  s.id            AS subscription_id,
  s.product_type,
  s.starts_at     AS subscription_starts_at,
  s.ends_at       AS subscription_ends_at,
  s.amount_paid,
  -- Flag de conveniência: tem plano vigente?
  (s.ends_at IS NOT NULL AND s.ends_at > NOW()) AS has_active_plan
FROM public.profiles p
LEFT JOIN LATERAL (
  -- Pega apenas a subscription ativa mais recente do produto principal
  SELECT *
  FROM public.subscriptions sub
  WHERE sub.user_id = p.id
    AND sub.product_type = 'nome_magnetico'
  ORDER BY sub.ends_at DESC
  LIMIT 1
) s ON TRUE;

-- RLS na view segue as políticas da tabela profiles subjacente.
-- A view é acessível via service role sem restrições adicionais.

-- ----------------------------------------------------------------
-- 3. Função: atualizar last_login_at ao garantir perfil
--    (chamada pelo endpoint /api/auth/ensure-profile)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_profile(
  p_user_id UUID,
  p_email    TEXT,
  p_nome     TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role, app_source, last_login_at)
  VALUES (
    p_user_id,
    p_email,
    COALESCE(p_nome, split_part(p_email, '@', 1)),
    'user',
    'nome_magnetico',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET last_login_at = NOW();
  -- Não sobrescreve role nem outros campos — apenas registra o login
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------
-- 4. Índice para acelerar consultas de admin (listagem por plano)
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS subscriptions_user_ends_at_idx
  ON public.subscriptions (user_id, ends_at DESC);
