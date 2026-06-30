-- ● Dados iniciais para tabela configuracoes
-- Execute este arquivo se a tabela configuracoes não tiver dados

INSERT INTO configuracoes (chave, valor, atualizado_em)
VALUES
  ('aviso_alunos', '', CURRENT_TIMESTAMP),
  ('banner_url', '', CURRENT_TIMESTAMP),
  ('link_asaas', '', CURRENT_TIMESTAMP)
ON CONFLICT (chave) DO NOTHING;

-- Verificar dados inseridos
SELECT * FROM configuracoes;
