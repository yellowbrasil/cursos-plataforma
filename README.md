# 🎓 AI PRO ACADEMY

Plataforma online de cursos e trilhas de aprendizado com controle total de professor e aluno.

## ✨ Características

- **Dashboard Professor**: Criar trilhas, módulos, lições e gerenciar alunos
- **Dashboard Aluno**: Acessar cursos inscritos e controlar progresso
- **Controle de Acesso**: Professor inscreve alunos e pode bloqueá-los temporariamente
- **Upload de Arquivos**: Imagens, PDFs, planilhas e documentos
- **Reordenação**: Reorganizar trilhas, módulos e lições
- **Banner & Avisos**: Sistema de notificações para alunos
- **Link Asaas**: Cada trilha com seu próprio link de pagamento
- **Autenticação JWT**: Segurança com tokens

## 🚀 Início Rápido

### Desenvolvimento Local

```bash
# Backend (porta 3001)
cd backend
npm install
npm run dev

# Frontend (porta 3002)
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:3002

### Credenciais de Teste
- Email: yellowbrasildigital@gmail.com
- Senha: senha123

## 🏗️ Arquitetura

```
AI Pro Academy
├── Frontend (Next.js 14, React 18)
│   ├── Dashboard Professor
│   ├── Dashboard Aluno
│   └── Autenticação
├── Backend (Express.js)
│   ├── API REST
│   ├── Autenticação JWT
│   └── Upload de Arquivos
└── Database (PostgreSQL)
    ├── Usuários
    ├── Trilhas/Módulos/Lições
    ├── Inscrições
    └── Progresso
```

## 📁 Estrutura do Projeto

```
cursos-plataforma/
├── frontend/          # Next.js frontend
│   ├── app/          # Pages e layouts
│   ├── components/   # Componentes React
│   └── .env.example  # Variáveis de ambiente
├── backend/          # Express backend
│   ├── server.js     # Servidor principal
│   ├── routes/       # Rotas da API
│   ├── middleware/   # Middlewares (auth, upload)
│   └── .env.example  # Variáveis de ambiente
└── database/         # SQL schema
    └── schema.sql    # Estrutura do banco
```

## 🌐 Deploy

Para colocar online em produção:

```bash
# Veja DEPLOY.md para instruções completas
```

Quickstart:
1. **Supabase**: Crie banco de dados e importe schema.sql
2. **Railway**: Deploy backend com variáveis de ambiente
3. **Vercel**: Deploy frontend com URL do Railway

## 🔐 Segurança

- ✅ Senhas com bcryptjs
- ✅ JWT com secret seguro
- ✅ CORS configurado
- ✅ Validação de arquivo
- ✅ Roles (professor/aluno)

## 📊 Banco de Dados

Tabelas principais:
- `users` - Usuários (professor/aluno)
- `trilhas` - Cursos
- `modulos` - Seções dentro de trilhas
- `licoes` - Aulas dentro de módulos
- `materiais` - Arquivos anexados
- `inscricoes` - Alunos inscritos em trilhas
- `progresso_licoes` - Progresso do aluno
- `configuracoes` - Sistema (banner, avisos)

## 🛠️ Tech Stack

**Frontend**
- Next.js 14
- React 18
- Axios
- CSS-in-JS

**Backend**
- Node.js
- Express
- PostgreSQL
- JWT
- Multer (upload)

**Hosting**
- Vercel (frontend)
- Railway (backend)
- Supabase (database)

## 📝 Licença

Direitos reservados © 2026 Fábio Schneider

## 🤝 Suporte

Para problemas:
1. Verifique DEPLOY.md
2. Consulte logs do servidor
3. Valide variáveis de ambiente

---

**Desenvolvido com ❤️ para educação online**
