-- Adicionar unique constraint na coluna task da tabela ai_config
-- Necessário para o upsert com onConflict: 'task' funcionar corretamente
ALTER TABLE public.ai_config
  ADD CONSTRAINT ai_config_task_unique UNIQUE (task);
