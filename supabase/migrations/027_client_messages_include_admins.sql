-- Nome Magnetico - include admins in client message campaigns
-- Permite campanhas de teste que incluem admins/testadores explicitamente.

ALTER TABLE public.client_messages
  ADD COLUMN IF NOT EXISTS include_admins BOOLEAN NOT NULL DEFAULT false;
