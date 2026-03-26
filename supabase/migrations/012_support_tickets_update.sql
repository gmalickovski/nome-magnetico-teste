-- Permitir tickets anônimos (usuários públicos sem login)
ALTER TABLE public.support_tickets
  ALTER COLUMN user_id DROP NOT NULL;


-- Guardar email do contato para tickets anônimos
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Guardar nome do contato para tickets anônimos
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- Referência cruzada com Chatwoot para lookup rápido
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS chatwoot_conversation_id TEXT;

-- Índice para lookup rápido pelo id do Chatwoot
CREATE INDEX IF NOT EXISTS idx_support_tickets_chatwoot
  ON public.support_tickets(chatwoot_conversation_id)
  WHERE chatwoot_conversation_id IS NOT NULL;

-- Permitir mensagens de usuários anônimos (sem auth.users)
ALTER TABLE public.support_messages
  ALTER COLUMN author_id DROP NOT NULL;
