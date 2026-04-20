-- Migration 022: tabela de feedback de satisfação coletado durante geração de PDF

CREATE TABLE IF NOT EXISTS public.analysis_feedback (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  analysis_id  UUID        REFERENCES public.analyses(id) ON DELETE SET NULL,
  product_type TEXT        NOT NULL,
  is_free      BOOLEAN     NOT NULL DEFAULT false,
  rating       SMALLINT    CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.analysis_feedback ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados inserem apenas seu próprio feedback
CREATE POLICY "insert_own_feedback" ON public.analysis_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins leem tudo
CREATE POLICY "admin_read_feedback" ON public.analysis_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
