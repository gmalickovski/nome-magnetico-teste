-- Migration 018: Remove campo saas da tabela leads
-- O projeto é um SaaS único, não há necessidade de distinguir por saas

ALTER TABLE public.leads DROP COLUMN IF EXISTS saas;

-- Remove constraint antiga (email, saas) e garante UNIQUE só em email
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_email_saas_key;
ALTER TABLE public.leads ADD CONSTRAINT leads_email_key UNIQUE (email);

-- Remove índice de saas (não existe mais)
DROP INDEX IF EXISTS leads_saas_idx;
