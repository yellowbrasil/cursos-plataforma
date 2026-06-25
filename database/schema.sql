-- Criar database
CREATE DATABASE cursos_db;

-- Conectar ao banco
\c cursos_db;

-- Tabela de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('admin', 'professor', 'aluno')),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de trilhas
CREATE TABLE trilhas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  ordem INTEGER DEFAULT 1,
  criado_por_professor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de módulos
CREATE TABLE modulos (
  id SERIAL PRIMARY KEY,
  trilha_id INTEGER NOT NULL REFERENCES trilhas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  ordem INTEGER DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de lições
CREATE TABLE licoes (
  id SERIAL PRIMARY KEY,
  modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  video_url VARCHAR(500) NOT NULL,
  ordem INTEGER DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de materiais complementares
CREATE TABLE materiais (
  id SERIAL PRIMARY KEY,
  licao_id INTEGER NOT NULL REFERENCES licoes(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  arquivo_url VARCHAR(500) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'pdf' CHECK (tipo IN ('pdf', 'planilha', 'docs', 'outro')),
  tamanho INTEGER DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de inscrições (aluno em trilha)
CREATE TABLE inscricoes (
  id SERIAL PRIMARY KEY,
  aluno_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trilha_id INTEGER NOT NULL REFERENCES trilhas(id) ON DELETE CASCADE,
  data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_conclusao TIMESTAMP,
  UNIQUE(aluno_id, trilha_id)
);

-- Tabela de progresso de lições
CREATE TABLE progresso_licoes (
  id SERIAL PRIMARY KEY,
  aluno_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  licao_id INTEGER NOT NULL REFERENCES licoes(id) ON DELETE CASCADE,
  data_ultima_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tempo_gasto_minutos INTEGER DEFAULT 0,
  concluido BOOLEAN DEFAULT FALSE,
  UNIQUE(aluno_id, licao_id)
);

-- Índices para performance
CREATE INDEX idx_trilhas_professor ON trilhas(criado_por_professor_id);
CREATE INDEX idx_modulos_trilha ON modulos(trilha_id);
CREATE INDEX idx_licoes_modulo ON licoes(modulo_id);
CREATE INDEX idx_materiais_licao ON materiais(licao_id);
CREATE INDEX idx_inscricoes_aluno ON inscricoes(aluno_id);
CREATE INDEX idx_inscricoes_trilha ON inscricoes(trilha_id);
CREATE INDEX idx_progresso_aluno ON progresso_licoes(aluno_id);
CREATE INDEX idx_progresso_licao ON progresso_licoes(licao_id);

-- Dados de teste (opcional)
-- INSERT INTO users (email, senha_hash, nome, tipo) VALUES
-- ('professor@email.com', '$2b$10$...hash...', 'Professor Teste', 'professor'),
-- ('aluno@email.com', '$2b$10$...hash...', 'Aluno Teste', 'aluno');
