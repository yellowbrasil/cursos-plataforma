-- ● MIGRATION: Adicionar controle de acesso temporal às inscrições
-- SAFE: Adiciona colunas com DEFAULT, não altera dados existentes

-- 1. Adicionar coluna de duração em dias
ALTER TABLE inscricoes 
ADD COLUMN IF NOT EXISTS duracao_dias INTEGER DEFAULT 30;

-- 2. Adicionar coluna de data de fim de acesso (calculada)
ALTER TABLE inscricoes 
ADD COLUMN IF NOT EXISTS data_fim_acesso TIMESTAMP DEFAULT NULL;

-- 3. Adicionar flag de bloqueio manual
ALTER TABLE inscricoes 
ADD COLUMN IF NOT EXISTS bloqueado_manualmente BOOLEAN DEFAULT FALSE;

-- 4. Adicionar coluna para rastrear renovações
ALTER TABLE inscricoes 
ADD COLUMN IF NOT EXISTS data_ultima_renovacao TIMESTAMP DEFAULT NULL;

-- 5. Preencher data_fim_acesso para inscrições existentes
-- Usa data_inicio (ou hoje se data_inicio é null) + duracao_dias
UPDATE inscricoes 
SET data_fim_acesso = COALESCE(data_inicio, CURRENT_TIMESTAMP) + (duracao_dias || ' days')::INTERVAL
WHERE data_fim_acesso IS NULL;

-- 6. Criar índice para performance na busca de expirados
CREATE INDEX IF NOT EXISTS idx_inscricoes_fim_acesso ON inscricoes(data_fim_acesso);

-- 7. Criar VIEW para fácil acesso a status de expiração
CREATE OR REPLACE VIEW v_inscricoes_status AS
SELECT 
  i.id,
  i.aluno_id,
  i.trilha_id,
  i.data_inicio,
  i.data_fim_acesso,
  i.duracao_dias,
  i.bloqueado,
  i.bloqueado_manualmente,
  CASE 
    WHEN i.bloqueado_manualmente = TRUE THEN 'bloqueado_manualmente'
    WHEN i.data_fim_acesso < CURRENT_TIMESTAMP THEN 'expirado'
    WHEN (i.data_fim_acesso - CURRENT_TIMESTAMP) < '15 days'::INTERVAL THEN 'expirando_em_breve'
    ELSE 'ativo'
  END as status_acesso,
  EXTRACT(DAY FROM (i.data_fim_acesso - CURRENT_TIMESTAMP))::INTEGER as dias_faltando
FROM inscricoes i;

COMMIT;
