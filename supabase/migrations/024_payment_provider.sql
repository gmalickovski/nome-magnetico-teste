-- Migration 024: suporte a múltiplos provedores de pagamento (Stripe e Asaas)
-- Adiciona payment_provider e asaas_payment_id na tabela subscriptions

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'stripe'
    CHECK (payment_provider IN ('stripe', 'asaas')),
  ADD COLUMN IF NOT EXISTS asaas_payment_id TEXT UNIQUE;

COMMENT ON COLUMN public.subscriptions.payment_provider IS 'Provedor de pagamento: stripe ou asaas';
COMMENT ON COLUMN public.subscriptions.asaas_payment_id IS 'ID do pagamento no Asaas (pay_...). NULL para compras via Stripe.';
