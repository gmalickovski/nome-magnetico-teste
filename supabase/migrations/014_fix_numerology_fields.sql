-- Migration 014: Corrigir campos numerológicos
-- numero_missao agora armazena Missão real = Destino + Expressão
-- numero_impressao (novo) armazena Impressão = consoantes do nome completo
-- numero_personalidade mantido por compatibilidade mas deprecated

ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS numero_impressao INTEGER;

ALTER TABLE magnetic_names
  ADD COLUMN IF NOT EXISTS numero_impressao INTEGER;

COMMENT ON COLUMN analyses.numero_missao IS 'Missão = Destino + Expressão (corrigido em v14)';
COMMENT ON COLUMN analyses.numero_impressao IS 'Impressão = consoantes do nome completo';
COMMENT ON COLUMN analyses.numero_personalidade IS 'Deprecated — use numero_impressao';

COMMENT ON COLUMN magnetic_names.numero_missao IS 'Missão = Destino + Expressão (corrigido em v14)';
COMMENT ON COLUMN magnetic_names.numero_impressao IS 'Impressão = consoantes do nome completo';
