-- Nome Magnetico - Client messages from HQ
-- Campanhas criadas no HQ e exibidas como popup/email na area /app.

CREATE TABLE IF NOT EXISTS public.client_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  public_title    TEXT NOT NULL,
  body_markdown   TEXT NOT NULL,
  channels        TEXT[] NOT NULL DEFAULT ARRAY['popup']::TEXT[],
  email_subject   TEXT,
  target_type     TEXT NOT NULL DEFAULT 'all'
    CHECK (target_type IN ('all', 'free', 'products')),
  target_products TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  include_admins  BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sending', 'sent', 'archived')),
  estimated_count INTEGER NOT NULL DEFAULT 0,
  popup_count     INTEGER NOT NULL DEFAULT 0,
  email_count     INTEGER NOT NULL DEFAULT 0,
  error_count     INTEGER NOT NULL DEFAULT 0,
  created_by      TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at         TIMESTAMPTZ,
  archived_at     TIMESTAMPTZ,
  CONSTRAINT client_messages_channels_check
    CHECK (channels <@ ARRAY['popup', 'email']::TEXT[] AND array_length(channels, 1) > 0),
  CONSTRAINT client_messages_products_check
    CHECK (target_products <@ ARRAY['nome_social', 'nome_bebe', 'nome_empresa']::TEXT[])
);

CREATE TABLE IF NOT EXISTS public.client_message_deliveries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id     UUID NOT NULL REFERENCES public.client_messages(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email     TEXT NOT NULL,
  user_name      TEXT,
  rendered_title TEXT,
  rendered_body_markdown TEXT,
  channels       TEXT[] NOT NULL DEFAULT ARRAY['popup']::TEXT[],
  popup_status   TEXT NOT NULL DEFAULT 'pending'
    CHECK (popup_status IN ('pending', 'seen', 'dismissed')),
  email_status   TEXT NOT NULL DEFAULT 'pending'
    CHECK (email_status IN ('pending', 'sent', 'error', 'skipped')),
  seen_at        TIMESTAMPTZ,
  dismissed_at   TIMESTAMPTZ,
  email_sent_at  TIMESTAMPTZ,
  email_error    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id),
  CONSTRAINT client_message_deliveries_channels_check
    CHECK (channels <@ ARRAY['popup', 'email']::TEXT[] AND array_length(channels, 1) > 0)
);

CREATE INDEX IF NOT EXISTS client_messages_status_idx
  ON public.client_messages (status, created_at DESC);

CREATE INDEX IF NOT EXISTS client_message_deliveries_pending_popup_idx
  ON public.client_message_deliveries (user_id, created_at)
  WHERE dismissed_at IS NULL AND channels @> ARRAY['popup']::TEXT[];

CREATE INDEX IF NOT EXISTS client_message_deliveries_message_idx
  ON public.client_message_deliveries (message_id, created_at DESC);

ALTER TABLE public.client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_message_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_messages_service_all" ON public.client_messages;
CREATE POLICY "client_messages_service_all" ON public.client_messages
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "client_message_deliveries_service_all" ON public.client_message_deliveries;
CREATE POLICY "client_message_deliveries_service_all" ON public.client_message_deliveries
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
