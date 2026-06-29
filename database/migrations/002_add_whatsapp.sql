-- PASSO 2: Adicionar coluna whatsapp à tabela users

-- Adicionar coluna whatsapp à tabela users (para armazenar número de contato do aluno)
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);

-- Criar índice para busca por whatsapp
CREATE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp);
