-- ================================================================
-- Nome Magnético — Fix RLS Recursion
-- Migration: 005_fix_rls_recursion
-- Resolve o erro de infinite recursion na tabela profiles
-- ================================================================

-- Cria uma função SECURITY DEFINER para checar se é admin
-- Isso faz com que a query rode com privilégios de bypass RLS,
-- evitando o loop infinito de "tabela profiles avalia RLS profiles_admin_all
-- que consulta a tabela profiles que avalia RLS profiles_admin_all..."
CREATE OR REPLACE FUNCTION nome_magnetico.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM nome_magnetico.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Corrige a RLS de admin na tabela profiles (causa primária do erro)
DROP POLICY IF EXISTS "profiles_admin_all" ON nome_magnetico.profiles;
CREATE POLICY "profiles_admin_all" ON nome_magnetico.profiles
  FOR ALL USING (nome_magnetico.is_admin());

-- Padroniza o resto das tabelas com a nova função
DROP POLICY IF EXISTS "subscriptions_admin_all" ON nome_magnetico.subscriptions;
CREATE POLICY "subscriptions_admin_all" ON nome_magnetico.subscriptions
  FOR ALL USING (nome_magnetico.is_admin());

DROP POLICY IF EXISTS "analyses_admin_all" ON nome_magnetico.analyses;
CREATE POLICY "analyses_admin_all" ON nome_magnetico.analyses
  FOR ALL USING (nome_magnetico.is_admin());

DROP POLICY IF EXISTS "ai_config_admin_all" ON nome_magnetico.ai_config;
CREATE POLICY "ai_config_admin_all" ON nome_magnetico.ai_config
  FOR ALL USING (nome_magnetico.is_admin());

DROP POLICY IF EXISTS "tickets_admin_all" ON nome_magnetico.support_tickets;
CREATE POLICY "tickets_admin_all" ON nome_magnetico.support_tickets
  FOR ALL USING (nome_magnetico.is_admin());

DROP POLICY IF EXISTS "messages_admin_all" ON nome_magnetico.support_messages;
CREATE POLICY "messages_admin_all" ON nome_magnetico.support_messages
  FOR ALL USING (nome_magnetico.is_admin());

DROP POLICY IF EXISTS "faq_categories_admin_all" ON nome_magnetico.faq_categories;
CREATE POLICY "faq_categories_admin_all" ON nome_magnetico.faq_categories
  FOR ALL USING (nome_magnetico.is_admin());

DROP POLICY IF EXISTS "faq_items_admin_all" ON nome_magnetico.faq_items;
CREATE POLICY "faq_items_admin_all" ON nome_magnetico.faq_items
  FOR ALL USING (nome_magnetico.is_admin());
