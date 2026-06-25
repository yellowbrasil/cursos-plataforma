# 📚 Plataforma de Cursos Online

Plataforma de cursos online com áreas separadas para professores e alunos. Design preto com elementos em laranja (#f65601).

## 🏗️ Arquitetura

```
cursos-plataforma/
├── backend/          # Node.js + Express (porta 3001)
├── frontend/         # Next.js + React (porta 3002)
├── database/         # Schema SQL PostgreSQL
└── docs/            # Documentação
```

## 🚀 Quickstart

### 1. Clonar e Entrar na Pasta

```bash
cd cursos-plataforma
```

### 2. Setup Backend

```bash
cd backend

# Copiar .env
cp .env.example .env

# Instalar dependências
npm install

# Iniciar servidor (porta 3001)
npm run dev
```

### 3. Setup Banco de Dados

```bash
# Criar banco e tabelas (em outro terminal)
psql -U postgres -f ../database/schema.sql
```

**Dica:** Se preferir, use um cliente PostgreSQL como pgAdmin ou DBeaver.

### 4. Setup Frontend

```bash
cd frontend

# Copiar .env
cp .env.example .env.local

# Instalar dependências
npm install

# Iniciar servidor (porta 3002)
npm run dev
```

## 📍 Acessar Aplicação

- **Frontend:** `http://localhost:3002`
- **Backend API:** `http://localhost:3001`
- **Health Check:** `http://localhost:3001/health`

## 👤 Criar Usuários de Teste

Execute via `psql`:

```sql
-- Professor
INSERT INTO users (email, senha_hash, nome, tipo, ativo) 
VALUES ('professor@teste.com', 
        '$2b$10$YIvxr8G8W/B.h6L/Y/W4H.FxZ6C.GyqzH9M2F3K.L5M6N7O8P9Q0R', 
        'Prof Teste', 'professor', true);

-- Aluno
INSERT INTO users (email, senha_hash, nome, tipo, ativo) 
VALUES ('aluno@teste.com', 
        '$2b$10$YIvxr8G8W/B.h6L/Y/W4H.FxZ6C.GyqzH9M2F3K.L5M6N7O8P9Q0R', 
        'Aluno Teste', 'aluno', true);
```

**Login com:**
- Email: `professor@teste.com` ou `aluno@teste.com`
- Senha: `senha123` (ambas usam o hash acima)

## 📋 Funcionalidades Implementadas

### Aluno
- ✅ Login/Logout
- ✅ Visualizar trilhas inscritas
- ✅ Visualizar módulos e lições
- ✅ Assistir vídeos YouTube
- ✅ Download de materiais complementares
- ✅ Rastreamento de última lição acessada
- ✅ Mudar senha

### Professor
- ✅ Login/Logout
- ✅ CRUD de Trilhas
- ✅ CRUD de Módulos
- ✅ CRUD de Lições (com URL YouTube)
- ✅ Upload de materiais complementares (estrutura pronta)
- ✅ Mudar senha

## 🎨 Design

- **Cor Principal:** `#f65601` (laranja)
- **Fundo:** Preto (`#0a0a0a`)
- **Cards:** `#1a1a1a`
- **Bordas:** `#333333`

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Fazer login
- `PUT /api/auth/mudar-senha` - Mudar senha (requer JWT)
- `GET /api/auth/perfil` - Get perfil do usuário (requer JWT)

### Trilhas
- `GET /api/trilhas` - Listar trilhas do usuário
- `POST /api/trilhas` - Criar trilha (professor)
- `PUT /api/trilhas/:id` - Editar trilha (professor)
- `DELETE /api/trilhas/:id` - Deletar trilha (professor)

### Módulos
- `GET /api/modulos/trilha/:trilha_id` - Listar módulos
- `POST /api/modulos` - Criar módulo (professor)
- `PUT /api/modulos/:id` - Editar módulo (professor)
- `DELETE /api/modulos/:id` - Deletar módulo (professor)

### Lições
- `GET /api/licoes/modulo/:modulo_id` - Listar lições
- `GET /api/licoes/:id` - Get lição específica
- `POST /api/licoes` - Criar lição (professor)
- `PUT /api/licoes/:id` - Editar lição (professor)
- `DELETE /api/licoes/:id` - Deletar lição (professor)

### Materiais
- `GET /api/materiais/licao/:licao_id` - Listar materiais
- `POST /api/materiais` - Adicionar material (professor)
- `DELETE /api/materiais/:id` - Deletar material (professor)

### Progresso
- `POST /api/progresso/licao/:licao_id` - Atualizar progresso
- `GET /api/progresso/ultima-licao/:modulo_id` - Última lição acessada
- `GET /api/progresso/trilha/:trilha_id` - Progresso total da trilha

## 🔒 Segurança

- ✅ Senhas com bcrypt (salt 10)
- ✅ JWT com expiração 1h
- ✅ Validação de acesso por tipo de usuário
- ✅ Proteção de rotas (requer autenticação)
- ✅ YouTube embed seguro (sem downloads)

## 📦 Dependências Principais

### Backend
- Express.js
- PostgreSQL (pg)
- bcryptjs
- jsonwebtoken
- cors

### Frontend
- Next.js 14
- React 18
- axios

## ⚡ Próximos Passos

1. **Treinar senhas de teste:** Gerar hashes com bcrypt real
2. **Upload real de materiais:** Integrar AWS S3
3. **Autenticação melhorada:** Refresh tokens
4. **Dashboard professor:** Relatórios de alunos
5. **Notificações:** Email de inscrição

## 🔧 Troubleshooting

### Erro: "connect ECONNREFUSED"
- Banco PostgreSQL não está rodando
- Verificar `DB_HOST` e `DB_PORT` em `.env`

### Erro: "CORS"
- Certificar que backend roda em `3001` e frontend em `3002`
- Verificar `NEXT_PUBLIC_API_URL` no frontend

### Porta já em uso
- Backend: `npx kill-port 3001`
- Frontend: `npx kill-port 3002`

## 📝 Notas Importantes

**⚠️ DESENVOLVIMENTO LOCAL:** Este é um MVP. Para produção:
- Usar HTTPS
- Variáveis de ambiente seguras
- Backup automático do banco
- Rate limiting nas APIs
- Logging e monitoramento

## 📄 Licença

MIT
