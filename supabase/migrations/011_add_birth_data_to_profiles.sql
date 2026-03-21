-- ================================================================
-- Nome Magnético — Migration: 003_add_birth_data_to_profiles
-- Descrição: Adiciona colunas para armazenar permanentemente 
-- o nome de nascimento e data de nascimento do usuário.
-- ================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS birth_name TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE;
