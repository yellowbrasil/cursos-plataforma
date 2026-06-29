# 🚀 AI PRO ACADEMY - PRODUÇÃO VPS

## ✅ Status Atual

**Sistema completamente migrado para VPS Hostinger**

- **URL:** http://69.62.93.231 (adicionar HTTPS em breve)
- **VPS:** Hostinger | 2vCPU | 12GB RAM | 100GB SSD
- **SO:** Ubuntu 24.04 LTS

## 📍 Componentes

### Frontend
- **Stack:** Next.js 14 | React 18 | Axios
- **Porta:** 3000
- **Comando:** `npm start`
- **PM2:** `cursos-frontend`
- **Acessar:** http://69.62.93.231

### Backend
- **Stack:** Express.js | Node.js | PostgreSQL
- **Porta:** 3001
- **Comando:** `./start.sh` (com source .env)
- **PM2:** `cursos-backend`
- **Acessar:** http://69.62.93.231/api

### Database
- **Sistema:** PostgreSQL 17.6
- **Porta:** 5432 (apenas localhost)
- **Database:** cursos_academy
- **Backups:** /backups/cursos_academy/

## 🔐 Credenciais de Acesso

### Professor
- **Email:** yellowbrasildigital@gmail.com
- **Senha:** senha123

### Aluno (Teste)
- **Email:** aluno@teste.com
- **Senha:** aluno123

## 📊 Capacidade Atual

- **Usuários Simultâneos:** ~50-100
- **Usuários Cadastrados:** ~500-1000
- **Performance:** 7/10

## 🔧 Gerenciamento

### Ver Status
```bash
pm2 status
```

### Logs
```bash
pm2 logs cursos-backend
pm2 logs cursos-frontend
```

### Reiniciar
```bash
pm2 restart cursos-backend
pm2 restart cursos-frontend
```

## 🔐 Segurança (Implementado)

✅ Secrets removidos do código  
✅ JWT seguro  
✅ Porta 5432 fechada  
✅ Firewall UFW ativo  
⏳ HTTPS (próximo passo)  

## 📝 Próximos Passos

1. Instalar HTTPS/SSL (Let's Encrypt)
2. Implementar rate limiting
3. Adicionar headers de segurança
4. Setup de logging centralizado

## 📄 Documentação Completa

Ver: `AUDITORIA_TECNICA_COMPLETA.md`
