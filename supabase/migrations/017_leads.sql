-- Migration 017: Tabela de leads do Nome Magnético
-- Captura contatos dos formulários de suporte antes da conversão

CREATE TABLE IF NOT EXISTS public.leads (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT        NOT NULL UNIQUE,
  nome             TEXT,
  assunto          TEXT,
  origem           TEXT,                          -- 'site-publico' | 'usuario-app'
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_contact_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: apenas service_role pode ler/escrever
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_service_all" ON public.leads;
CREATE POLICY "leads_service_all" ON public.leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Índice para busca por email
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads (email);
