-- Nome Magnetico - rendered client message fields
-- Guarda o snapshot personalizado por destinatario, usado por popup e email.

ALTER TABLE public.client_message_deliveries
  ADD COLUMN IF NOT EXISTS rendered_title TEXT,
  ADD COLUMN IF NOT EXISTS rendered_body_markdown TEXT;
