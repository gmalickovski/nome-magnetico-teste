-- ================================================================
-- Nome Magnético — Schema completo
-- Migration: 001_nome_magnetico
-- ================================================================

-- Criar schema dedicado
CREATE SCHEMA IF NOT EXISTS nome_magnetico;

-- ================================================================
-- PROFILES
-- ================================================================
CREATE TABLE IF NOT EXISTS nome_magnetico.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE nome_magnetico.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON nome_magnetico.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON nome_magnetico.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON nome_magnetico.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nome_magnetico.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION nome_magnetico.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO nome_magnetico.profiles (id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION nome_magnetico.handle_new_user();

-- ================================================================
-- SUBSCRIPTIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS nome_magnetico.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL DEFAULT 'nome_magnetico'
    CHECK (product_type IN ('nome_magnetico', 'nome_bebe', 'nome_empresa')),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER, -- em centavos
  currency TEXT DEFAULT 'brl',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coluna computada: is_active
CREATE OR REPLACE FUNCTION nome_magnetico.subscription_is_active(sub nome_magnetico.subscriptions)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN sub.ends_at > NOW();
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS
ALTER TABLE nome_magnetico.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON nome_magnetico.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_service_insert" ON nome_magnetico.subscriptions
  FOR INSERT WITH CHECK (TRUE); -- service role only via RLS bypass

CREATE POLICY "subscriptions_admin_all" ON nome_magnetico.subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nome_magnetico.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ================================================================
-- ANALYSES
-- ================================================================
CREATE TABLE IF NOT EXISTS nome_magnetico.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL DEFAULT 'nome_magnetico'
    CHECK (product_type IN ('nome_magnetico', 'nome_bebe', 'nome_empresa')),
  -- Input
  nome_completo TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  -- Numerologia calculada
  numero_expressao INTEGER,
  numero_destino INTEGER,
  numero_motivacao INTEGER,
  numero_missao INTEGER,
  numero_personalidade INTEGER,
  arcano_regente INTEGER,
  bloqueios JSONB DEFAULT '[]',
  triangulo_da_vida JSONB,
  -- Análise IA
  analise_texto TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'complete', 'error')),
  error_message TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON nome_magnetico.analyses(user_id);
CREATE INDEX IF NOT EXISTS analyses_status_idx ON nome_magnetico.analyses(status);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON nome_magnetico.analyses(created_at DESC);

-- RLS
ALTER TABLE nome_magnetico.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analyses_select_own" ON nome_magnetico.analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "analyses_insert_own" ON nome_magnetico.analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "analyses_update_own" ON nome_magnetico.analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "analyses_admin_all" ON nome_magnetico.analyses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nome_magnetico.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ================================================================
-- MAGNETIC_NAMES
-- ================================================================
CREATE TABLE IF NOT EXISTS nome_magnetico.magnetic_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES nome_magnetico.analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_sugerido TEXT NOT NULL,
  numero_expressao INTEGER,
  numero_motivacao INTEGER,
  numero_missao INTEGER,
  tem_bloqueio BOOLEAN NOT NULL DEFAULT FALSE,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  justificativa TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE nome_magnetico.magnetic_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "magnetic_names_select_own" ON nome_magnetico.magnetic_names
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "magnetic_names_service_insert" ON nome_magnetico.magnetic_names
  FOR INSERT WITH CHECK (TRUE);

-- ================================================================
-- AI_CONFIG
-- ================================================================
CREATE TABLE IF NOT EXISTS nome_magnetico.ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'groq'
    CHECK (provider IN ('groq', 'claude', 'openai')),
  model TEXT NOT NULL,
  task TEXT NOT NULL,
  temperature NUMERIC(3,2) NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 4096,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed inicial
INSERT INTO nome_magnetico.ai_config (provider, model, task, temperature, max_tokens) VALUES
  ('groq', 'llama-3.3-70b-versatile', 'analysis', 0.7, 4096),
  ('groq', 'llama-3.3-70b-versatile', 'suggestions', 0.8, 2048),
  ('groq', 'llama-3.3-70b-versatile', 'guide', 0.6, 3000)
ON CONFLICT DO NOTHING;

-- RLS — só admin gerencia
ALTER TABLE nome_magnetico.ai_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_config_admin_all" ON nome_magnetico.ai_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nome_magnetico.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "ai_config_select_service" ON nome_magnetico.ai_config
  FOR SELECT USING (TRUE); -- leitura pública para o backend

-- ================================================================
-- AI_USAGE (Loop Guard)
-- ================================================================
CREATE TABLE IF NOT EXISTS nome_magnetico.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  analysis_id UUID REFERENCES nome_magnetico.analyses(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  task TEXT NOT NULL,
  tokens_input INTEGER NOT NULL DEFAULT 0,
  tokens_output INTEGER NOT NULL DEFAULT 0,
  tokens_total INTEGER NOT NULL DEFAULT 0,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  similar_to_previous BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para rate limiting
CREATE INDEX IF NOT EXISTS ai_usage_user_id_created ON nome_magnetico.ai_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_usage_analysis_id ON nome_magnetico.ai_usage(analysis_id);

-- RLS
ALTER TABLE nome_magnetico.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_service_all" ON nome_magnetico.ai_usage
  FOR ALL USING (TRUE); -- service role only

-- ================================================================
-- SUPPORT_TICKETS
-- ================================================================
CREATE TABLE IF NOT EXISTS nome_magnetico.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE nome_magnetico.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_select_own" ON nome_magnetico.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tickets_insert_own" ON nome_magnetico.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tickets_admin_all" ON nome_magnetico.support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nome_magnetico.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ================================================================
-- SUPPORT_MESSAGES
-- ================================================================
CREATE TABLE IF NOT EXISTS nome_magnetico.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES nome_magnetico.support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE nome_magnetico.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_ticket_owner" ON nome_magnetico.support_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM nome_magnetico.support_tickets t
      WHERE t.id = ticket_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_ticket_owner" ON nome_magnetico.support_messages
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM nome_magnetico.support_tickets t
      WHERE t.id = ticket_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_admin_all" ON nome_magnetico.support_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nome_magnetico.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ================================================================
-- FAQ_CATEGORIES
-- ================================================================
CREATE TABLE IF NOT EXISTS nome_magnetico.faq_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS — público para leitura, admin para escrita
ALTER TABLE nome_magnetico.faq_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faq_categories_public_select" ON nome_magnetico.faq_categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "faq_categories_admin_all" ON nome_magnetico.faq_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nome_magnetico.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ================================================================
-- FAQ_ITEMS
-- ================================================================
CREATE TABLE IF NOT EXISTS nome_magnetico.faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES nome_magnetico.faq_categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE nome_magnetico.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faq_items_public_select" ON nome_magnetico.faq_items
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "faq_items_admin_all" ON nome_magnetico.faq_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nome_magnetico.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ================================================================
-- Seed FAQ inicial
-- ================================================================
INSERT INTO nome_magnetico.faq_categories (title, slug, order_index) VALUES
  ('Sobre a Análise', 'sobre-analise', 1),
  ('Pagamento e Acesso', 'pagamento-acesso', 2),
  ('Numerologia Cabalística', 'numerologia', 3),
  ('Suporte Técnico', 'suporte', 4)
ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- RATE LIMIT helpers (para uso no backend)
-- ================================================================
-- Função para verificar rate limit por IP no teste-bloqueio
CREATE OR REPLACE FUNCTION nome_magnetico.check_rate_limit_ip(
  p_ip TEXT,
  p_limit INTEGER DEFAULT 3,
  p_window_hours INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Esta função é chamada via service role, precisa de uma tabela de controle
  -- Por ora retorna TRUE (permitido) — implementar com redis ou tabela dedicada
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
