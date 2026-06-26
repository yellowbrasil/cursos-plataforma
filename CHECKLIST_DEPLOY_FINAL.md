# ✅ CHECKLIST DE DEPLOYMENT - AI PRO ACADEMY

**Data**: 26 de Junho de 2026  
**Status**: 🟢 **PRONTO PARA IR AO AR**  
**Tempo estimado**: 15 minutos

---

## 📋 ANTES DE COMEÇAR

- [ ] Você tem conta no GitHub? (yellowbrasil/cursos-plataforma)
- [ ] Você tem conta no Railway? (ou vai criar - é grátis)
- [ ] Você tem conta no Vercel? (ou vai criar - é grátis)

---

## 🚂 RAILWAY (Backend)

### Preparação
- [ ] Abra: https://railway.app
- [ ] Faça login com GitHub

### Criar Projeto
- [ ] Clique "Create New Project"
- [ ] Selecione "GitHub Repo"
- [ ] Procure por "cursos-plataforma"
- [ ] Clique "Deploy"

### Configurar Variáveis
- [ ] Clique em "Variables" ou "Settings"
- [ ] Copie EXATAMENTE estas linhas:

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

- [ ] Clique "Deploy"
- [ ] ⏱️ **Aguarde 5 minutos**
- [ ] Veja a mensagem "✅ Deployment Success"
- [ ] **COPIE A URL** que aparecer (ex: https://heartfelt-nature-prod.up.railway.app)
- [ ] **SALVE ESSA URL** - você vai precisar no próximo passo!

**URL do Railway:**
```
https://[COLE-AQUI-A-URL-COPIADA]
```

---

## 🎨 VERCEL (Frontend)

### Preparação
- [ ] Abra: https://vercel.com
- [ ] Faça login com GitHub

### Importar Projeto
- [ ] Clique "Add New" → "Project"
- [ ] Procure por "cursos-plataforma"
- [ ] Clique "Import"

### Configurar Variável
- [ ] Procure por "Environment Variables"
- [ ] Adicione:
  ```
  NEXT_PUBLIC_API_URL=https://[COLE-A-URL-DO-RAILWAY]
  ```
  
  **Exemplo:**
  ```
  NEXT_PUBLIC_API_URL=https://heartfelt-nature-prod.up.railway.app
  ```

- [ ] Clique "Deploy"
- [ ] ⏱️ **Aguarde 3 minutos**
- [ ] Veja a mensagem "✅ Deployment Successful"
- [ ] **COPIE A URL** do seu site (será algo como: https://ai-pro-academy-prod.vercel.app)

**URL do Vercel:**
```
https://ai-pro-academy-prod.vercel.app
```

---

## ✅ TESTAR O SISTEMA

### Login
- [ ] Abra: https://ai-pro-academy-prod.vercel.app
- [ ] Email: `yellowbrasildigital@gmail.com`
- [ ] Senha: `senha123`

### Funcionalidades
- [ ] Dashboard carregou?
- [ ] Consegue ver as trilhas?
- [ ] Consegue criar uma trilha?
- [ ] Upload de imagem funciona?
- [ ] Banner aparece?
- [ ] Menu lateral está laranja?
- [ ] Link "Sair" funciona?

### Se Tudo Funcionar
- [ ] 🎉 **PARABÉNS! SEU SISTEMA ESTÁ ONLINE!**

---

## 🆘 PROBLEMAS?

### Problema: "Cannot connect to database"
```
❌ Solução: Verifique se a senha do Supabase é exatamente F024151f@#$
   (com os caracteres especiais @#$)
```

### Problema: "API_URL is undefined"
```
❌ Solução: Verifique se a variável começa com NEXT_PUBLIC_
   (pode ter espaços extras?)
```

### Problema: "Deployment failed"
```
❌ Solução: Clique no deployment que falhou e veja a mensagem de erro
   (procure por "red" ou "error" na página)
```

---

## 📊 RESUMO FINAL

| Serviço | Status | URL |
|---------|--------|-----|
| **GitHub** | ✅ Código pronto | https://github.com/yellowbrasil/cursos-plataforma |
| **Railway** | ⏳ Deployando... | https://seu-projeto-prod.up.railway.app |
| **Vercel** | ⏳ Deployando... | https://ai-pro-academy-prod.vercel.app |
| **Supabase** | ✅ Pronto | https://supabase.com/dashboard |

---

## 🎯 PRÓXIMAS ETAPAS (Depois que tudo estiver online)

1. Fazer backups automáticos (Supabase)
2. Configurar domínio customizado (ai-pro-academy.com.br)
3. Adicionar SSL (já vem grátis)
4. Monitorar logs e performance
5. Configurar email de suporte

---

## 💡 DICAS IMPORTANTES

✅ **Ao fazer mudanças no código:**
```bash
git add -A
git commit -m "sua mensagem"
git push origin main
# Railway e Vercel fazem deploy automático (~2-5 min)
```

✅ **URLs importantes:**
- Dashboard GitHub: https://github.com/yellowbrasil/cursos-plataforma
- Dashboard Railway: https://railway.app/dashboard
- Dashboard Vercel: https://vercel.com/dashboard
- Dashboard Supabase: https://supabase.com/dashboard

✅ **Credenciais de teste:**
- Email: yellowbrasildigital@gmail.com
- Senha: senha123
- Tipo: Professor

---

## ⏱️ CRONOGRAMA ESTIMADO

| Etapa | Tempo | Status |
|-------|-------|--------|
| Preparação | 2 min | ✅ Feito |
| Railway Deploy | 5-10 min | ⏳ Você faz |
| Vercel Deploy | 3-5 min | ⏳ Você faz |
| Testes | 5 min | ⏳ Você faz |
| **TOTAL** | **15-22 min** | 🎯 |

---

**Siga este checklist e seu sistema estará 100% ONLINE!** 🚀

**Dúvidas?** Veja:
- `DEPLOY_PASSO_A_PASSO.md` - Guia visual passo a passo
- `DEPLOY.md` - Documentação completa
- `RAILWAY_VERCEL_CONFIG.txt` - Cópia de variáveis
