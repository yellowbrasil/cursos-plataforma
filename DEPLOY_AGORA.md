# 🚀 DEPLOY AGORA - 15 MINUTOS

## ✅ PRÉ-REQUISITOS
- [x] Código no GitHub: `https://github.com/yellowbrasil/cursos-plataforma`
- [x] Supabase Database: Pronto
- [ ] Conta Railway (free): https://railway.app
- [ ] Conta Vercel (free): https://vercel.com

---

## 🚂 PASSO 1: RAILWAY (BACKEND) - 5 MIN

### 1.1 Criar Projeto
1. Acesse: **https://railway.app**
2. Clique **"Start a New Project"**
3. Selecione **"GitHub Repo"**
4. Conecte sua conta GitHub
5. Procure por **"cursos-plataforma"**
6. Clique **"Deploy"**

### 1.2 Configurar Variáveis
No painel do Railway que aparecer:

1. Clique em **"Variables"** (ou⚙️ Settings)
2. Adicione EXATAMENTE estas variáveis:

```
DB_HOST=db.tkycshgylushbmxmyvul.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=F024151f@#$
DB_NAME=postgres
JWT_SECRET=fa5ac88a0323fd113316beb926ff10aac34aea3f5103261d78b18304bbf5f9e7
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://ai-pro-academy-prod.vercel.app
```

3. Clique **"Deploy"** (ou aguarde auto-deploy)
4. **COPIE A URL** que aparecer (será algo como: `https://seu-projeto-prod.up.railway.app`)

⏱️ Aguarde 2-5 minutos até aparecer "Deployment Success"

---

## 🎨 PASSO 2: VERCEL (FRONTEND) - 5 MIN

### 2.1 Importar Projeto
1. Acesse: **https://vercel.com**
2. Clique **"Add New"** → **"Project"**
3. Procure por **"cursos-plataforma"**
4. Clique **"Import"**

### 2.2 Configurar Variáveis
1. Em **"Environment Variables"**, adicione:

```
NEXT_PUBLIC_API_URL=[COLE-A-URL-DO-RAILWAY-AQUI]
```

**Exemplo:**
```
NEXT_PUBLIC_API_URL=https://heartfelt-nature-prod.up.railway.app
```

(Use a URL que você copiou no Passo 1.4)

2. Clique **"Deploy"**

⏱️ Aguarde 2-3 minutos até aparecer "Deployment Successful"

---

## ✅ PASSO 3: TESTAR - 5 MIN

### 3.1 Acessar o Sistema
1. Vá para: **https://ai-pro-academy-prod.vercel.app**
2. Faça login com:
   - **Email**: `yellowbrasildigital@gmail.com`
   - **Senha**: `senha123`

### 3.2 Verificar
- [ ] Login funciona?
- [ ] Dashboard carrega?
- [ ] Consegue criar trilha?
- [ ] Imagem upload funciona?
- [ ] Banner aparece?

Se tudo ok → **🎉 SISTEMA ONLINE!**

---

## 🆘 SE ALGO DER ERRADO

### "Cannot connect to database"
→ Verifique se a senha do Supabase está EXATAMENTE: `F024151f@#$`
→ Copia caracteres especiais com cuidado!

### "API_URL is undefined"
→ Verifique se tem `NEXT_PUBLIC_` no começo da variável
→ Sem espaços extras!

### "Deployment failed"
→ Clique em "Deployments" e veja a mensagem de erro
→ Ou contacte: claude-code ou Discord

---

## 📞 URLS FINAIS

```
Frontend: https://ai-pro-academy-prod.vercel.app
Backend:  https://[sua-url-railway]
Database: https://supabase.com/dashboard
GitHub:   https://github.com/yellowbrasil/cursos-plataforma
```

---

**⏱️ Tempo total: ~15 minutos**
**Status: 🟢 PRONTO PARA IR AO AR**

Siga os passos acima que seu sistema estará 100% online! 🚀
