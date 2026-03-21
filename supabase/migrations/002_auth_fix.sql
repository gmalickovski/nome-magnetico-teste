-- ================================================================
-- Nome Magnético — Auth Fix
-- Migration: 002_auth_fix
-- Resolve conflito de auth.users compartilhado com outras apps
-- na mesma instância Supabase self-hosted (ex: Sincro).
-- ================================================================

-- Adicionar coluna app_source para rastrear origem do perfil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS app_source TEXT NOT NULL DEFAULT 'nome_magnetico';

-- ================================================================
-- Função ensure_profile (upsert seguro)
-- Chamada após login de usuários que já existem em auth.users
-- mas ainda não têm perfil em public.profiles
-- (ex: usuários vindos do Sincro)
-- ================================================================
CREATE OR REPLACE FUNCTION public.ensure_profile(
  p_user_id UUID,
  p_email    TEXT,
  p_nome     TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role, app_source)
  VALUES (
    p_user_id,
    p_email,
    COALESCE(p_nome, split_part(p_email, '@', 1)),
    'user',
    'nome_magnetico'
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- Atualizar trigger handle_new_user para incluir app_source
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, app_source)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    'nome_magnetico'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
