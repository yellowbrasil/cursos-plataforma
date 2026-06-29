-- PASSO 1: Adicionar coluna ativo para soft delete nas tabelas de conteúdo

-- Adicionar coluna ativo à tabela trilhas
ALTER TABLE trilhas ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- Adicionar coluna ativo à tabela modulos
ALTER TABLE modulos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- Adicionar coluna ativo à tabela licoes
ALTER TABLE licoes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- Adicionar coluna ativo à tabela materiais
ALTER TABLE materiais ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- Criar índices para filtrar apenas ativos (melhor performance)
CREATE INDEX IF NOT EXISTS idx_trilhas_ativo ON trilhas(ativo) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_modulos_ativo ON modulos(ativo) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_licoes_ativo ON licoes(ativo) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_materiais_ativo ON materiais(ativo) WHERE ativo = TRUE;
