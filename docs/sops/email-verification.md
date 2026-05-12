# Email verification flow

## Purpose

Nome Magnetico grants first access immediately after account creation. Supabase
Auth can therefore have `email_confirmed_at` set early, while the user-facing
dashboard banner is controlled by the app-level marker:

- Primary marker: `profiles.email_verified_at`
- Fallback marker: `auth.users.raw_user_meta_data.email_verified_at`

The fallback keeps the app stable if the database migration has not yet been
applied. The profile column remains the canonical reporting-friendly field.

## Required database migration

Run the versioned migration in `supabase/migrations/028_profile_email_verified_at.sql`.
If applying manually in the Supabase SQL editor, use:

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.email_verified_at IS
  'App-level email verification marker used by the dashboard banner. Supabase Auth may be confirmed early for frictionless access.';
```

## Runtime flow

1. The dashboard banner calls `/api/auth/resend-confirmation`.
2. Supabase sends a magic link to `/auth/confirmar-email`.
3. `EmailConfirmation` validates the token with Supabase, syncs the session
   cookies, and calls `/api/auth/mark-email-verified`.
4. The endpoint writes `email_verified_at` into Auth user metadata and, when the
   migration exists, into `profiles.email_verified_at`.
5. `/app` hides the banner if either marker is present.

## Manual recovery for a user already verified before this fix

After the migration exists, a support/admin recovery can mark a single known
user as verified:

```sql
UPDATE public.profiles
SET email_verified_at = NOW()
WHERE email = 'usuario@example.com'
  AND email_verified_at IS NULL;
```

Prefer asking the user to click a newly sent verification link when possible,
because that also writes the Auth metadata fallback.
