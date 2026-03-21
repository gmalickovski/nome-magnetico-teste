-- Migration: Taggear usuários existentes do Nome Magnético em auth.users.app_metadata
--
-- Contexto: o Supabase self-hosted é compartilhado por múltiplos apps (Nome Magnético,
-- Sincro, etc). Para isolar autenticação por app sem instâncias separadas, usamos
-- app_metadata.apps como lista de apps aos quais o usuário pertence.
--
-- Esta migration retroativamente adiciona 'nome_magnetico' ao campo apps de todos
-- os usuários que já têm perfil em public.profiles.

DO $$
DECLARE
  r RECORD;
  current_apps jsonb;
BEGIN
  FOR r IN
    SELECT id FROM public.profiles
  LOOP
    SELECT raw_app_meta_data->'apps'
    INTO current_apps
    FROM auth.users
    WHERE id = r.id;

    -- Pular se já taggeado
    IF current_apps IS NOT NULL AND current_apps @> '"nome_magnetico"'::jsonb THEN
      CONTINUE;
    END IF;

    UPDATE auth.users
    SET raw_app_meta_data =
      CASE
        -- sem app_metadata: criar do zero
        WHEN raw_app_meta_data IS NULL OR raw_app_meta_data = 'null'::jsonb THEN
          '{"apps": ["nome_magnetico"]}'::jsonb

        -- app_metadata existe mas sem chave apps: adicionar
        WHEN raw_app_meta_data->'apps' IS NULL THEN
          raw_app_meta_data || '{"apps": ["nome_magnetico"]}'::jsonb

        -- apps existe mas sem esta tag: adicionar ao array existente
        ELSE
          jsonb_set(
            raw_app_meta_data,
            '{apps}',
            (raw_app_meta_data->'apps') || '"nome_magnetico"'::jsonb
          )
      END
    WHERE id = r.id;
  END LOOP;

  RAISE NOTICE 'App tagging concluído para usuários do Nome Magnético.';
END $$;
