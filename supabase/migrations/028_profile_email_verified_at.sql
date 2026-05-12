-- 028_profile_email_verified_at.sql
-- App-level email verification marker used by the dashboard banner.
-- Supabase Auth is confirmed early for frictionless access; this field tracks
-- the later user-facing verification flow.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
