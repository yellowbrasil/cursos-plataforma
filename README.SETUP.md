# ⚡ Setup Rápido (5 minutos)

## 1️⃣ Pré-requisitos
- Node.js 18+ (você já tem v24 ✅)
- Docker (instale se não tiver)

## 2️⃣ Iniciar TUDO de uma vez

```bash
cd /Users/fabioschnaider/cursos-plataforma
chmod +x run.sh
./run.sh
```

**Pronto!** Aguarde terminar. Sistema estará rodando em:
- Frontend: http://localhost:3002
- Backend: http://localhost:3001

## 3️⃣ Login de Teste

```
Email: professor@teste.com ou aluno@teste.com
Senha: senha123
```

## 4️⃣ Testar Fluxo Completo

### Professor:
1. Login → Dashboard
2. "+ Nova Trilha" → "Marketing Digital"
3. "+ Novo Módulo" → "Fundamentos de SEO"
4. "+ Nova Lição" → nome: "O que é SEO?" + URL YouTube (copie qualquer link do YouTube)

### Aluno:
1. Login → "Explorar"
2. "Se Inscrever" na trilha
3. "Minhas Trilhas" → Ver módulos → Assistir vídeo

---

## 🛑 Parar Sistema

```bash
# Terminal principal
Ctrl+C

# Parar banco de dados
docker-compose down
```

## ⚙️ Troubleshooting

### "Port 5432 already in use"
```bash
docker-compose down
```

### "Docker not found"
Instale: https://www.docker.com/products/docker-desktop

### Limpar tudo
```bash
docker-compose down -v
rm -rf backend/node_modules frontend/node_modules
```

---

**Está funcionando? Avança! Agora vamos para [Produção](./DEPLOYMENT.md)**
