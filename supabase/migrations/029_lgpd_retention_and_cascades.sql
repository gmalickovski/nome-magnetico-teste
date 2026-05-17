-- ================================================================
-- Nome Magnetico - Adequacao LGPD: Exclusao em Cascata e Retencao
-- Migration: 029_lgpd_retention_and_cascades
-- ================================================================

-- Limpa residuos legados de usuarios que ja nao existem mais no Auth.
-- Isso e necessario antes de criar as FKs novas.
WITH orphan_users AS (
  SELECT DISTINCT a.user_id
  FROM public.analyses a
  LEFT JOIN auth.users u ON u.id = a.user_id
  WHERE u.id IS NULL
),
orphan_analyses AS (
  SELECT a.id
  FROM public.analyses a
  JOIN orphan_users ou ON ou.user_id = a.user_id
)
DELETE FROM public.ai_usage au
USING orphan_analyses oa
WHERE au.analysis_id = oa.id;

WITH orphan_users AS (
  SELECT DISTINCT a.user_id
  FROM public.analyses a
  LEFT JOIN auth.users u ON u.id = a.user_id
  WHERE u.id IS NULL
),
orphan_analyses AS (
  SELECT a.id
  FROM public.analyses a
  JOIN orphan_users ou ON ou.user_id = a.user_id
)
DELETE FROM public.magnetic_names mn
USING orphan_analyses oa
WHERE mn.analysis_id = oa.id;

DELETE FROM public.ai_usage au
WHERE au.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = au.user_id
  );

DELETE FROM public.magnetic_names mn
WHERE NOT EXISTS (
  SELECT 1
  FROM auth.users u
  WHERE u.id = mn.user_id
);

DELETE FROM public.analyses a
WHERE NOT EXISTS (
  SELECT 1
  FROM auth.users u
  WHERE u.id = a.user_id
);

DO $$
DECLARE
  fk_record RECORD;
BEGIN
  -- 1. profiles.id -> auth.users.id
  FOR fk_record IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND t.relname = 'profiles'
      AND pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY (id)%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', fk_record.conname);
  END LOOP;
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

  -- 2. analyses.user_id -> auth.users.id
  FOR fk_record IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND t.relname = 'analyses'
      AND pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY (user_id)%'
  LOOP
    EXECUTE format('ALTER TABLE public.analyses DROP CONSTRAINT %I', fk_record.conname);
  END LOOP;
  ALTER TABLE public.analyses
    ADD CONSTRAINT analyses_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

  -- 3. magnetic_names.user_id -> auth.users.id
  FOR fk_record IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND t.relname = 'magnetic_names'
      AND pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY (user_id)%'
  LOOP
    EXECUTE format('ALTER TABLE public.magnetic_names DROP CONSTRAINT %I', fk_record.conname);
  END LOOP;
  ALTER TABLE public.magnetic_names
    ADD CONSTRAINT magnetic_names_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

  -- 4. ai_usage.user_id -> auth.users.id
  FOR fk_record IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND t.relname = 'ai_usage'
      AND pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY (user_id)%'
  LOOP
    EXECUTE format('ALTER TABLE public.ai_usage DROP CONSTRAINT %I', fk_record.conname);
  END LOOP;
  ALTER TABLE public.ai_usage
    ADD CONSTRAINT ai_usage_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

  -- 5. ai_usage.analysis_id -> analyses.id
  FOR fk_record IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND t.relname = 'ai_usage'
      AND pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY (analysis_id)%'
  LOOP
    EXECUTE format('ALTER TABLE public.ai_usage DROP CONSTRAINT %I', fk_record.conname);
  END LOOP;
  ALTER TABLE public.ai_usage
    ADD CONSTRAINT ai_usage_analysis_id_fkey
    FOREIGN KEY (analysis_id) REFERENCES public.analyses(id) ON DELETE CASCADE;

  -- 6. subscriptions.user_id -> auth.users.id
  ALTER TABLE public.subscriptions ALTER COLUMN user_id DROP NOT NULL;
  FOR fk_record IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND t.relname = 'subscriptions'
      AND pg_get_constraintdef(c.oid) LIKE 'FOREIGN KEY (user_id)%'
  LOOP
    EXECUTE format('ALTER TABLE public.subscriptions DROP CONSTRAINT %I', fk_record.conname);
  END LOOP;
  ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
END $$;

-- ================================================================
-- Hardening RLS
-- ================================================================

DROP POLICY IF EXISTS "ai_usage_service_all" ON public.ai_usage;
CREATE POLICY "ai_usage_service_all" ON public.ai_usage
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "ai_config_select_service" ON public.ai_config;
CREATE POLICY "ai_config_select_service" ON public.ai_config
  FOR SELECT
  USING (is_active = TRUE);
