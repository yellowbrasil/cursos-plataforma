# 🚀 DEPLOY PASSO A PASSO - SUPER SIMPLES

> ⏱️ **Tempo total: 15 minutos**

---

## 📌 RESUMO RÁPIDO

Você tem 2 serviços para colocar online:
1. **Backend** → Railway
2. **Frontend** → Vercel

Ambos pegam o código do seu GitHub automaticamente!

---

# 🚂 PASSO 1: RAILWAY (Backend)

## 1️⃣ Abrir Railway
```
Acesse: https://railway.app
```

## 2️⃣ Criar Novo Projeto
- Clique em **"Create a new Project"** ou **"Start a New Project"**
- Selecione **"GitHub Repo"**
- Será pedido para conectar seu GitHub (faça login se pedir)
- Procure por **"cursos-plataforma"** (será yellowbrasil/cursos-plataforma)
- Clique **"Deploy"** ou **"Import"**

## 3️⃣ Configurar Variáveis de Ambiente
Agora você está no painel do Railway. Procure por:
- **"Variables"** ou **"Environment"** ou **"⚙️ Settings"**

Clique lá e adicione EXATAMENTE essas linhas:

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

**⚠️ IMPORTANTE:**
- Copie EXATAMENTE incluindo os caracteres especiais `@#$`
- Não deixe espaços em branco no final
- Se errar a senha, o banco não conecta!

## 4️⃣ Deploy
- Clique **"Deploy"** (ou aguarde auto-deploy começar)
- Você verá aparecer uma URL algo como:
  ```
  https://seu-projeto-prod.up.railway.app
  ```
  ou
  ```
  https://heartfelt-nature-prod.up.railway.app
  ```

⏱️ **Aguarde 5 minutos** até aparecer algo como "Deployment Status: ✅ Success"

## 5️⃣ COPIE A URL DO RAILWAY
Você vai usar essa URL no próximo passo!

**Exemplo da URL:**
```
https://heartfelt-nature-prod.up.railway.app
```

---

# 🎨 PASSO 2: VERCEL (Frontend)

## 1️⃣ Abrir Vercel
```
Acesse: https://vercel.com
```

## 2️⃣ Importar Projeto
- Clique **"Add New"** → **"Project"**
- Selecione **"Import Git Repository"**
- Procure por **"cursos-plataforma"**
- Clique **"Import"**

## 3️⃣ Configurar Variável
Você verá uma tela de configuração. Procure por **"Environment Variables"**

Adicione:
```
NEXT_PUBLIC_API_URL=https://[COLE-A-URL-DO-RAILWAY-AQUI]
```

**Exemplo completo:**
```
NEXT_PUBLIC_API_URL=https://heartfelt-nature-prod.up.railway.app
```

(Use a URL que você copiou no Passo 1.5!)

## 4️⃣ Deploy
- Clique **"Deploy"**
- Você verá aparecer uma tela com barras de progresso

⏱️ **Aguarde 3 minutos** até aparecer "Deployment Successful"

## 5️⃣ VOCÊ TEM A URL DO SEU SITE!
Será algo como:
```
https://ai-pro-academy-prod.vercel.app
```

---

# ✅ PASSO 3: TESTAR TUDO

## 1️⃣ Abrir o Site
```
Acesse: https://ai-pro-academy-prod.vercel.app
```

## 2️⃣ Fazer Login
Use essas credenciais:
- **Email**: `yellowbrasildigital@gmail.com`
- **Senha**: `senha123`

## 3️⃣ Verificar Funcionalidades
Teste se está tudo funcionando:

- [ ] Login funcionou?
- [ ] Dashboard carregou?
- [ ] Consegue ver as trilhas?
- [ ] Consegue criar uma trilha?
- [ ] Upload de imagem funciona?
- [ ] Banner aparece na tela?

## 4️⃣ SUCESSO! 🎉
Se tudo funciona → **Seu sistema está ONLINE!**

---

# 🆘 TROUBLESHOOTING

## ❌ "Connection refused" ou "Cannot connect to database"
**Solução:**
- Verifique a variável `DB_PASSWORD` no Railway
- Tem que ser EXATAMENTE: `F024151f@#$`
- Se errou, edite no painel do Railway

## ❌ "API_URL is undefined"
**Solução:**
- Verifique se a variável começa com `NEXT_PUBLIC_`
- Sem espaços extras no começo ou fim
- Re-deploy no Vercel

## ❌ "Cannot GET /"
**Solução:**
- Verifique se o Vercel fez deploy (vá em Deployments)
- Se tiver erro, clique "Redeploy"

## ❌ "Deployment failed"
**Solução:**
- Clique no deployment que falhou
- Veja a mensagem de erro
- Se for sobre `NODE_ENV`, está tudo bem, é aviso
- Se for sobre git, repositório está conectado

---

# 📞 LINKS IMPORTANTES

```
GitHub:    https://github.com/yellowbrasil/cursos-plataforma
Vercel:    https://vercel.com/dashboard
Railway:   https://railway.app/dashboard
Supabase:  https://supabase.com/dashboard
```

---

# 🎯 RESUMO FINAL

```
✅ Código no GitHub         → https://github.com/yellowbrasil/cursos-plataforma
✅ Backend no Railway       → https://seu-projeto-prod.up.railway.app
✅ Frontend no Vercel       → https://ai-pro-academy-prod.vercel.app
✅ Database no Supabase     → Pronto e sincronizado
```

---

**Siga os passos acima e seu sistema estará 100% ONLINE em menos de 20 minutos! 🚀**

Qualquer dúvida, volte para este documento!
