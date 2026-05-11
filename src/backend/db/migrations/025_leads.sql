-- 025_leads.sql
-- Tabela de leads captados pela prévia gratuita na landing page /analise-gratuita
-- Renomeada para analise_leads (tabela 'leads' já existe com outra finalidade)
-- Alimentada pelo endpoint /api/save-lead (sem autenticação)

CREATE TABLE IF NOT EXISTS public.analise_leads (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT        NOT NULL,
  nome_completo    TEXT        NOT NULL,
  data_nascimento  TEXT        NOT NULL, -- mantém formato DD/MM/AAAA
  source           TEXT        NOT NULL DEFAULT 'analise_gratuita',
  converted_user_id UUID       REFERENCES auth.users(id) ON DELETE SET NULL,
  converted_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS analise_leads_email_idx ON public.analise_leads(lower(email));
CREATE INDEX IF NOT EXISTS analise_leads_user_idx  ON public.analise_leads(converted_user_id);

ALTER TABLE public.analise_leads ENABLE ROW LEVEL SECURITY;
-- Sem políticas públicas: apenas service role key (backend) acessa esta tabela.
