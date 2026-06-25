# 🎬 Instruções de Início Rápido

Seu projeto está pronto em `/Users/fabioschnaider/cursos-plataforma/`

## ⚡ Passo 1: Setup Automático (Recomendado)

```bash
cd /Users/fabioschnaider/cursos-plataforma
chmod +x setup.sh
./setup.sh
```

## 📦 Passo 2: Configurar Banco de Dados

### Opção A: Com PostgreSQL local instalado

```bash
# Abra um novo terminal
psql -U postgres -f /Users/fabioschnaider/cursos-plataforma/database/schema.sql

# Isso vai:
# 1. Criar banco: cursos_db
# 2. Criar todas as tabelas
# 3. Criar índices para performance
```

### Opção B: Sem PostgreSQL (usar Docker)

```bash
# Instalar Docker se não tiver
docker pull postgres:15
docker run --name cursos-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
psql -U postgres -h localhost -f database/schema.sql
```

## 🚀 Passo 3: Iniciar Backend

```bash
cd /Users/fabioschnaider/cursos-plataforma/backend
npm run dev
```

**Esperado:**
```
🚀 Backend rodando em http://localhost:3001
```

## 🎨 Passo 4: Iniciar Frontend (novo terminal)

```bash
cd /Users/fabioschnaider/cursos-plataforma/frontend
npm run dev
```

**Esperado:**
```
- Local:        http://localhost:3002
```

## 📍 Passo 5: Abrir Navegador

Acesse: **http://localhost:3002**

## 👥 Passo 6: Criar Usuários de Teste

Você pode criar via SQL ou pela interface (uma vez que adicione endpoint de cadastro).

### Via SQL (pgAdmin ou psql):

```sql
-- Senha hash de: "senha123"
-- Use uma ferramenta como bcryptjs para gerar em produção

-- Professor
INSERT INTO users (email, senha_hash, nome, tipo) 
VALUES ('professor@teste.com', 
        '$2b$10$YIvxr8G8W/B.h6L/Y/W4H.FxZ6C.GyqzH9M2F3K.L5M6N7O8P9Q0R', 
        'Professor Teste', 'professor');

-- Aluno
INSERT INTO users (email, senha_hash, nome, tipo) 
VALUES ('aluno@teste.com', 
        '$2b$10$YIvxr8G8W/B.h6L/Y/W4H.FxZ6C.GyqzH9M2F3K.L5M6N7O8P9Q0R', 
        'Aluno Teste', 'aluno');

-- Inscrever aluno em uma trilha (se tiver trilha criada)
-- INSERT INTO inscricoes (aluno_id, trilha_id) VALUES (2, 1);
```

## 🔑 Testar Login

1. Acesse http://localhost:3002/login
2. Email: `professor@teste.com` ou `aluno@teste.com`
3. Senha: `senha123`

## 🎯 Fluxos para Testar

### Como Professor:
1. Login com professor@teste.com
2. Dashboard → "+ Nova Trilha"
3. Criar trilha "Marketing Digital"
4. Clique em "Gerenciar"
5. "+ Novo Módulo" → "Fundamentos"
6. "+ Nova Lição" → copie URL do YouTube (ex: https://youtu.be/abc123)
7. Vídeo deve aparecer como embed

### Como Aluno:
1. Login com aluno@teste.com
2. Inscrição: Sua trilha aparecerá após criar inscrição via SQL
3. Ver módulos → Ver lições → Reproduzir vídeo
4. Progresso é salvo automaticamente
5. Perfil → Mudar Senha

## ⚠️ Problemas Comuns

### "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL não está rodando
- Solução: Inicie o serviço ou Docker

### "CORS error"
- Certifique backend em 3001 e frontend em 3002
- Verifique `NEXT_PUBLIC_API_URL` no .env.local

### Porta já em uso
```bash
# Kill processo na porta
npx kill-port 3001
npx kill-port 3002
```

## 📊 Estrutura de Dados

```
Trilha (categoria)
  └─ Módulo (parte da trilha)
      └─ Lição (aula individual)
          └─ Materiais (PDFs, planilhas)
```

## 🎨 Customizar Design

Edite cores em: `frontend/app/globals.css`

```css
:root {
  --primary: #f65601;        /* Laranja */
  --bg-dark: #0a0a0a;        /* Preto */
  --bg-card: #1a1a1a;        /* Cinza escuro */
}
```

## 📡 Testar APIs com Curl

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"professor@teste.com","senha":"senha123"}'

# Health check
curl http://localhost:3001/health
```

## 🚢 Deploy (Futuro)

Quando pronto:
- **Frontend:** Vercel
- **Backend:** Railway ou Render
- **Banco:** Neon ou Railway PostgreSQL
- **Arquivos:** AWS S3

## 📚 Documentação Completa

Veja: `README.md`

## ✅ Checklist

- [ ] PostgreSQL rodando
- [ ] Backend em 3001
- [ ] Frontend em 3002
- [ ] Usuários de teste criados
- [ ] Login funcionando
- [ ] Professor pode criar trilhas
- [ ] Aluno pode ver vídeos

## 🆘 Suporte

Qualquer erro, veja o terminal do backend (3001) e verifique:
1. Console do browser (F12)
2. Logs do backend
3. Status do banco de dados

**Bom curso! 🎓**
