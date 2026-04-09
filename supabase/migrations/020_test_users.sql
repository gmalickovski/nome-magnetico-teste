-- Adiciona campos is_test e test_ends_at na tabela profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS test_ends_at TIMESTAMPTZ DEFAULT NULL;

-- Tabela para registrar de onde veio o acesso trial (rastreabilidade HQ)
CREATE TABLE IF NOT EXISTS trial_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_code TEXT NOT NULL,          -- código gerado no HQ
  trial_days INTEGER NOT NULL,
  product_type TEXT,
  source TEXT DEFAULT 'link',        -- 'link' | 'manual'
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, trial_code)
);

-- RLS: apenas service_role pode ler/escrever trial_redemptions
ALTER TABLE trial_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON trial_redemptions
  USING (auth.role() = 'service_role');
