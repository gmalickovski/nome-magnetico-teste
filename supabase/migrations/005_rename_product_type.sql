-- Migration: 005_rename_product_type
-- Renomeia o valor 'nome_magnetico' → 'nome_social' na coluna product_type.
-- "Nome Magnético" é o nome do SaaS; o produto se chama "Nome Social".

-- 1. Atualizar dados existentes
UPDATE subscriptions SET product_type = 'nome_social' WHERE product_type = 'nome_magnetico';
UPDATE analyses     SET product_type = 'nome_social' WHERE product_type = 'nome_magnetico';

-- 2. Recriar CHECK constraints
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_product_type_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_product_type_check
  CHECK (product_type IN ('nome_social', 'nome_bebe', 'nome_empresa'));

ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_product_type_check;
ALTER TABLE analyses ADD CONSTRAINT analyses_product_type_check
  CHECK (product_type IN ('nome_social', 'nome_bebe', 'nome_empresa'));

-- 3. Atualizar DEFAULT nas colunas
ALTER TABLE subscriptions ALTER COLUMN product_type SET DEFAULT 'nome_social';
ALTER TABLE analyses      ALTER COLUMN product_type SET DEFAULT 'nome_social';
