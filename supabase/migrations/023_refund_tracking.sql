-- Migration 023: rastreamento de reembolsos nas subscriptions
-- Adiciona campos para registrar reembolsos processados (via app ou manualmente no Stripe)

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS refund_stripe_refund_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS refund_reason TEXT NULL;

COMMENT ON COLUMN subscriptions.refunded_at IS 'Data do reembolso. Quando preenchido, a subscription está cancelada (ends_at também é setado para now()).';
COMMENT ON COLUMN subscriptions.refund_stripe_refund_id IS 'ID do refund no Stripe (re_...). NULL para usuários teste/admin.';
COMMENT ON COLUMN subscriptions.refund_reason IS 'Motivo opcional informado pelo usuário ao solicitar o reembolso.';
