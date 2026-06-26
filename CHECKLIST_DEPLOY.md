# ✅ CHECKLIST DE DEPLOY

## 🟢 JÁ FEITO (Automático)

- ✅ Supabase: Banco de dados criado
- ✅ Supabase: Schema importado (todas as tabelas)
- ✅ GitHub: Código versionado
- ✅ Documentação: DEPLOY.md criado
- ✅ Credenciais: Salvas em ~/.cursos-credentials.json

## 🟡 PRÓXIMOS PASSOS (Manual - Você faz no navegador)

### 1️⃣ RAILWAY (Backend) - ~5 minutos

- [ ] Acesse https://railway.app
- [ ] Faça login com GitHub
- [ ] Crie novo projeto e conecte "cursos-plataforma"
- [ ] Configure variáveis (veja DEPLOY.md):
  - [ ] DB_HOST
  - [ ] DB_PORT
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] DB_NAME
  - [ ] JWT_SECRET
  - [ ] NODE_ENV
  - [ ] PORT
  - [ ] FRONTEND_URL
- [ ] Clique "Deploy"
- [ ] Aguarde 2-5 minutos
- [ ] **COPIE A URL DO RAILWAY** (será usada no Vercel)

### 2️⃣ VERCEL (Frontend) - ~5 minutos

- [ ] Acesse https://vercel.com
- [ ] Faça login com GitHub
- [ ] Importe projeto "cursos-plataforma"
- [ ] Configure variável:
  - [ ] NEXT_PUBLIC_API_URL = [URL do Railway]
- [ ] Clique "Deploy"
- [ ] Aguarde 2-3 minutos
- [ ] **COPIE A URL DO VERCEL** (seu site!)

## 🟢 TESTE TUDO

- [ ] Acesse https://seu-projeto.vercel.app
- [ ] Faça login (yellowbrasildigital@gmail.com / senha123)
- [ ] Dashboard carrega?
- [ ] Criar trilha funciona?
- [ ] Upload de imagem funciona?
- [ ] Tudo funcionando? 🎉

## 📝 NOTAS IMPORTANTES

1. **JWT_SECRET**: Gere uma chave aleatória segura. Nunca reutilize a de desenvolvimento!
2. **Variáveis de Ambiente**: Não commitadas (estão em .gitignore)
3. **Senha Supabase**: A senha tem caracteres especiais (@#$) - está correta!

## 🚀 DEPOIS DE ONLINE

Para fazer mudanças:

```bash
# 1. Altere código localmente
# 2. Teste em http://localhost:3002
# 3. Faça push
git push origin main

# 4. Railway e Vercel fazem deploy automático (~2-5 min)
```

## 💡 DICAS

- Verifique os logs do Railway e Vercel se algo deu errado
- Certifique-se que NEXT_PUBLIC_API_URL não tem barra final (/)
- Se imagens não aparecerem, verifique o endpoint GET /api/trilhas/:id/imagem

---

**Tempo total estimado: ~15 minutos para tudo online!** ⏱️
