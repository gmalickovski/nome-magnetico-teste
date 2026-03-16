/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { User } from '@supabase/supabase-js';

declare namespace App {
  interface Locals {
    user: User | null;
    accessToken: string | null;
  }
}

interface ImportMetaEnv {
  readonly APP_ENV: 'development' | 'production';
  readonly APP_URL: string;
  readonly SUPABASE_URL: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_WEBHOOK_SECRET: string;
  readonly STRIPE_PRICE_NOME_MAGNETICO: string;
  readonly STRIPE_PRICE_NOME_BEBE: string;
  readonly STRIPE_PRICE_NOME_EMPRESA: string;
  readonly GROQ_API_KEY: string;
  readonly ANTHROPIC_API_KEY: string;
  readonly OPENAI_API_KEY: string;
  readonly N8N_WEBHOOK_URL: string;
  readonly N8N_WEBHOOK_SECRET: string;
  readonly RATE_LIMIT_TESTE_BLOQUEIO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
