# 🚀 Guia de Deploy - AI Pro Academy

Este arquivo contém instruções para colocar o sistema online.

## 📋 PRÉ-REQUISITOS

- ✅ Conta no Supabase (banco de dados criado e schema importado)
- ✅ Conta no Railway (para backend)
- ✅ Conta no Vercel (para frontend)
- ✅ Repositório GitHub com o código

## 🔧 PASSO 1: RAILWAY (Backend)

### 1.1 Conectar GitHub ao Railway
1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique "Create New Project"
4. Selecione "GitHub Repo"
5. Procure por "cursos-plataforma"
6. Conecte o repositório

### 1.2 Configurar Variáveis de Ambiente
No painel do Railway, vá para "Variables" e adicione:

```
DB_HOST=db.XXXXX.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_do_supabase
DB_NAME=postgres
JWT_SECRET=gere_uma_chave_aleatoria_segura
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://seu-projeto.vercel.app
```

### 1.3 Deploy
1. Clique "Deploy"
2. Aguarde 2-5 minutos
3. Copie a URL do backend (será algo como: https://seu-projeto-prod.up.railway.app)

## 🎨 PASSO 2: VERCEL (Frontend)

### 2.1 Conectar GitHub ao Vercel
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique "Add New" → "Project"
4. Procure por "cursos-plataforma"
5. Clique "Import"

### 2.2 Configurar Variáveis de Ambiente
Na aba "Environment Variables", adicione:

```
NEXT_PUBLIC_API_URL=https://seu-projeto-prod.up.railway.app
```

(Use a URL do Railway que você copiou no Passo 1.3)

### 2.3 Deploy
1. Clique "Deploy"
2. Aguarde 2-3 minutos
3. Seu site estará em: https://seu-projeto.vercel.app

## ✅ TESTE TUDO

1. Acesse: https://seu-projeto.vercel.app
2. Faça login com:
   - Email: yellowbrasildigital@gmail.com
   - Senha: senha123
3. Teste todas as funcionalidades:
   - [ ] Dashboard carrega?
   - [ ] Criar trilha funciona?
   - [ ] Upload de imagem funciona?
   - [ ] Alunos conseguem acessar?

## 🔄 COMO FAZER MUDANÇAS DEPOIS

Para atualizar o sistema online:

```bash
# 1. Altere o código localmente
# 2. Teste em localhost
# 3. Faça commit
git add -A
git commit -m "seu message aqui"

# 4. Faça push para GitHub
git push origin main

# 5. Railway e Vercel detectam automaticamente e fazem deploy!
# (leva ~2-5 minutos)
```

## 🆘 TROUBLESHOOTING

**Erro: "Cannot connect to database"**
- Verifique se a CONNECTION STRING no Railway está correta
- Verifique se a senha tem caracteres especiais escapados

**Erro: "API_URL is undefined"**
- Verifique se NEXT_PUBLIC_API_URL está configurado no Vercel
- Não esqueça o "NEXT_PUBLIC_" no começo!

**Imagens não aparecem**
- Certifique-se que as imagens foram uploadadas localmente
- O endpoint GET /api/trilhas/:id/imagem está funcionando?

## 📞 SUPORTE

Para mais informações:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
