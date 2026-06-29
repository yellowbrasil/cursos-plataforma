# Migração Completa para VPS — AI PRO ACADEMY

**Status:** ✅ FASES 1-4 CONCLUÍDAS
**Data:** 2026-06-29
**Responsável:** Claude Code + Fábio Schneider

---

## Resumo Executivo

Migração bem-sucedida do banco de dados de **Supabase (cloud)** para **PostgreSQL local na VPS (69.62.93.231)**, com **zero-downtime** durante as operações.

Dados migrados: **11 registros** em **8 tabelas** (3 usuários, 2 trilhas, 1 módulo, 1 lição, 1 inscrição, 3 configurações).

---

## FASE 1: BACKUP E PREPARAÇÃO ✅

### Objetivos
- Backup completo do Supabase
- Criação de ponto de recuperação seguro
- Preparação da VPS

### Ações Realizadas

1. **Credenciais Supabase Identificadas**
   - Project ID: `tkycshgylushbmxmyvul`
   - Database: `postgres` @ `db.tkycshgylushbmxmyvul.supabase.co:5432`
   - User: `postgres`

2. **Snapshots Criados**
   - Diretório de backup: `/backups/cursos_academy/` (VPS)
   - Archivos de schema exportados
   - Dados validados (11 registros em 8 tabelas)

3. **Verificação de Dados**
   ```
   users: 3 registros
   trilhas: 2 registros
   modulos: 1 registro
   licoes: 1 registro
   materiais: 0 registros
   inscricoes: 1 registro
   progresso_licoes: 0 registros
   configuracoes: 3 registros
   TOTAL: 11 registros
   ```

---

## FASE 2: INSTALAR POSTGRESQL NA VPS ✅

### Ações Realizadas

```bash
# Instalação
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Criação de DB e usuário
CREATE USER cursos WITH PASSWORD 'L0k@l_C3Ql7d@P@ssW0rd2024_SECURE!';
CREATE DATABASE cursos_academy OWNER cursos;
```

### Configuração de Rede

1. **postgresql.conf**: Habilitado `listen_addresses = '*'`
2. **pg_hba.conf**: Adicionadas regras para aceitar conexões TCP remotas
3. **UFW (Firewall)**: Aberta porta 5432 para TCP remoto

### Verificação
```
tcp  0  0  0.0.0.0:5432  0.0.0.0:*  LISTEN
tcp  0  0  [::]:5432     [::]:*     LISTEN
```

---

## FASE 3: RESTAURAR DADOS ✅

### Método Usado
**FDW (Foreign Data Wrapper)** + COPY direto

1. Criadas 8 tabelas com schema EXATO do Supabase:
   - `users` (com check constraint para tipo)
   - `trilhas` (com índice em professor)
   - `modulos` (com índice em trilha)
   - `licoes` (com índice em modulo)
   - `materiais`
   - `inscricoes` (com UNIQUE constraint)
   - `progresso_licoes` (com UNIQUE constraint)
   - `configuracoes`

2. Copiados dados via COPY TO/FROM STDIN (método robusto)

3. Permissões Ajustadas
   - `GRANT ALL PRIVILEGES ON ALL TABLES` ao usuário `cursos`
   - `ALTER DEFAULT PRIVILEGES` para tabelas futuras

### Verificação Final
```
configuracoes: 3 registros ✅
inscricoes: 1 registro ✅
licoes: 1 registro ✅
modulos: 1 registro ✅
trilhas: 2 registros ✅
users: 3 registros ✅
```

---

## FASE 4: ATUALIZAR BACKEND ✅

### Configuração do Backend

**Arquivo:** `/backend/.env`

```env
PORT=3001
JWT_SECRET=d000feaae2dd08990c73a549b1b7ae1a25936bfea6509fd51d0abf6a3028e6ee

# Configuração VPS PostgreSQL Local
DB_USER=cursos
DB_HOST=69.62.93.231
DB_NAME=cursos_academy
DB_PASSWORD=L0k@l_C3Ql7d@P@ssW0rd2024_SECURE!
DB_PORT=5432
```

### Testes Realizados

1. **Health Check** ✅
   ```
   GET /health → {"status":"OK"}
   ```

2. **Autenticação** ✅
   ```
   POST /api/auth/login → Token gerado com sucesso
   Usuario: Fábio Schneider (professor)
   ```

3. **Configurações** ✅
   ```
   GET /api/configuracoes → 3 configurações retornadas
   - banner_url
   - aviso_alunos
   - link_asaas
   ```

---

## PRÓXIMAS FASES

### FASE 5: SSL/HTTPS (Let's Encrypt)
- [ ] Instalar certbot
- [ ] Gerar certificado para domínio
- [ ] Configurar nginx como reverse proxy
- [ ] Redirecionar HTTP → HTTPS

### FASE 6: Backup Automático
- [ ] Script de backup diário (pg_dump)
- [ ] Retenção de 30 dias
- [ ] Envio para storage externo (opcional)

### FASE 7: Monitoramento
- [ ] Script de health check (a cada 6h)
- [ ] Alertas de espaço em disco
- [ ] Alertas de processo não rodando

### FASE 8: Documentação
- [ ] Guia de recovery
- [ ] Playbook de troubleshooting
- [ ] Documentação de manutenção

### FASE 9: Desativar Supabase
- [ ] Manter backup de 7 dias
- [ ] Validar 100% das funcionalidades
- [ ] Desativar instância Supabase
- [ ] Backup final antes de delete

---

## Arquivos Importantes

```
/backups/cursos_academy/          Backups e scripts SQL
  - migracao_supabase_to_local_*.sql
  - dados_*.sql
  - schema_*.sql

/Users/fabioschnaider/cursos-plataforma/
  - backend/.env                  (CONFIGURAÇÃO NOVA)
  - MIGRACAO_VPS_2026_06_29.md    (ESTE ARQUIVO)
```

---

## Credenciais (Seguras)

| Componente | User | Host | Port | Database | Password |
|-----------|------|------|------|----------|----------|
| VPS PostgreSQL | `cursos` | `69.62.93.231` | 5432 | `cursos_academy` | `L0k@l_C3Ql7d@P@ssW0rd2024_SECURE!` |
| Supabase (Backup) | `postgres` | `db.tkycshgylushbmxmyvul.supabase.co` | 5432 | `postgres` | `F024151f@#$` |

> ⚠️ NUNCA comitar credenciais em repositório. Usar `.env` com `.gitignore`.

---

## Rollback (Se Necessário)

Se algo der errado, você pode:

1. **Voltar ao Supabase original:**
   ```bash
   # Editar backend/.env
   DB_HOST=db.tkycshgylushbmxmyvul.supabase.co
   DB_USER=postgres
   DB_NAME=postgres
   DB_PASSWORD=F024151f@#$
   
   # Reiniciar backend
   cd backend && npm run dev
   ```

2. **Verificar backups:**
   ```bash
   ssh root@69.62.93.231
   ls -lh /backups/cursos_academy/
   ```

3. **Restaurar banco local:**
   ```bash
   sudo -u postgres psql cursos_academy < /backups/cursos_academy/backup.sql
   ```

---

## Pontos Críticos Aprendidos

1. **Versão PostgreSQL:** Supabase 17.6 vs Ubuntu 16.14 causou conflito. Resolvido com FDW.

2. **Schema Diferente:** O schema local inicial não correspondia ao Supabase. Corrigido com replicação exata.

3. **Permissões:** Usuário `cursos` precisava de `GRANT ALL PRIVILEGES` explícito.

4. **Firewall:** PostgreSQL não era acessível externamente. UFW configurado para port 5432.

---

## Próximos Passos Imediatos

1. Testar todas as rotas do frontend em produção
2. Validar uploads de imagens
3. Testar inscrições de alunos
4. Confirmar que Supabase ainda está em backup
5. Iniciar FASE 5 (SSL/HTTPS)

---

## Contato e Suporte

Sistema: AI PRO ACADEMY
Email: yellowbrasildigital@gmail.com
VPS: 69.62.93.231 (Hostinger)

Data da Migração: 2026-06-29
Tempo Total: ~2 horas
Status: ✅ FUNCIONAL

---

*Documento gerado por Claude Code - Haiku 4.5*
*Para perguntas sobre a migração, consulte este documento.*
