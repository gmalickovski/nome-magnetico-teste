-- 026_public_analysis_rate_limits.sql
-- Rate limit da previa publica da analise gratuita: 3 consultas por IP a cada 24h.

CREATE TABLE IF NOT EXISTS public.public_analysis_rate_limits (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash         TEXT        NOT NULL,
  nome_consultado TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS public_analysis_rate_limits_ip_created_idx
  ON public.public_analysis_rate_limits(ip_hash, created_at DESC);

ALTER TABLE public.public_analysis_rate_limits ENABLE ROW LEVEL SECURITY;
-- Sem politicas publicas: apenas service role key acessa a tabela.
