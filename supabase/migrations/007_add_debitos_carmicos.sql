-- Migration 007: Adicionar coluna debitos_carmicos à tabela analyses
ALTER TABLE nome_magnetico.analyses
  ADD COLUMN IF NOT EXISTS debitos_carmicos JSONB DEFAULT '[]';
