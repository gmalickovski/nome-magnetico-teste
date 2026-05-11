-- 027_profile_email_verified_at.sql
-- App-level email verification marker. Supabase Auth may be confirmed early to
-- allow frictionless first access, while this field controls the dashboard banner.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
