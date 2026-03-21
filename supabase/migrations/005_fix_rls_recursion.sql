-- ================================================================
-- Nome Magnético — Fix RLS Recursion
-- Migration: 005_fix_rls_recursion
-- Resolve o erro de infinite recursion na tabela profiles
-- ================================================================

-- Cria uma função SECURITY DEFINER para checar se é admin
-- Isso faz com que a query rode com privilégios de bypass RLS,
-- evitando o loop infinito de "tabela profiles avalia RLS profiles_admin_all
-- que consulta a tabela profiles que avalia RLS profiles_admin_all..."
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Corrige a RLS de admin na tabela profiles (causa primária do erro)
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin());

-- Padroniza o resto das tabelas com a nova função
DROP POLICY IF EXISTS "subscriptions_admin_all" ON public.subscriptions;
CREATE POLICY "subscriptions_admin_all" ON public.subscriptions
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "analyses_admin_all" ON public.analyses;
CREATE POLICY "analyses_admin_all" ON public.analyses
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "ai_config_admin_all" ON public.ai_config;
CREATE POLICY "ai_config_admin_all" ON public.ai_config
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "tickets_admin_all" ON public.support_tickets;
CREATE POLICY "tickets_admin_all" ON public.support_tickets
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "messages_admin_all" ON public.support_messages;
CREATE POLICY "messages_admin_all" ON public.support_messages
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "faq_categories_admin_all" ON public.faq_categories;
CREATE POLICY "faq_categories_admin_all" ON public.faq_categories
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "faq_items_admin_all" ON public.faq_items;
CREATE POLICY "faq_items_admin_all" ON public.faq_items
  FOR ALL USING (public.is_admin());
