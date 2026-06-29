# Sistema de Gerenciamento de Alunos - README

## TL;DR (Muito Longo; Não Li)

```bash
# 1. Executar migrations no Supabase SQL Editor
cat database/migrations/001_add_soft_delete.sql
cat database/migrations/002_add_whatsapp.sql

# 2. Iniciar backend
cd backend && npm run dev

# 3. Iniciar frontend
cd frontend && npm run dev

# 4. Abrir http://localhost:3000 → Login → Menu → Gerenciar Alunos
```

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (Next.js/React)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Page: /professor/alunos                                │ │
│  │ - Tabela de alunos                                     │ │
│  │ - Campo de busca                                       │ │
│  │ - Formulário criar aluno                              │ │
│  │ - Botões: Editar, Bloquear, Remover                   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Axios HTTP
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 Backend (Express.js)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Route: /api/admin/alunos                               │ │
│  │ - POST   /         → Criar aluno                       │ │
│  │ - GET    /         → Listar com busca                 │ │
│  │ - GET    /:id      → Detalhes                         │ │
│  │ - PUT    /:id/status → Bloquear/desbloquear           │ │
│  │ - DELETE /:id      → Soft delete                      │ │
│  │ - PUT    /:id/trilhas → Editar acesso                │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Routes Modificadas: /trilhas, /modulos, /licoes        │ │
│  │ - DELETE /:id      → Soft delete (ativo = false)      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ libpq (PostgreSQL Driver)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│           Database (PostgreSQL/Supabase)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Table: users                                           │ │
│  │ - id, email, senha_hash, nome, tipo, ativo, whatsapp │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Table: trilhas                                         │ │
│  │ - id, nome, descrição, ativo (NOVO), ...              │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Table: modulos, licoes, materiais                     │ │
│  │ - Todos com coluna ativo (NOVO)                       │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Table: inscricoes                                      │ │
│  │ - Relaciona alunos com trilhas                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Fluxos de Negócio

### 1. Criar Aluno

```
Professor
    │
    ├─ Clica "Novo Aluno"
    ├─ Preenche: Nome, Email, WhatsApp, Senha
    ├─ Clica "Criar Aluno"
    │
    └─ API: POST /api/admin/alunos
       ├─ Valida email único
       ├─ Valida senha (min 8 chars)
       ├─ Hash da senha (bcrypt)
       ├─ Insert no banco
       └─ Retorna aluno criado
       
Resultado: Aluno aparece na tabela ✅
```

### 2. Editar Acesso às Trilhas

```
Professor
    │
    ├─ Clica "Editar" em aluno
    ├─ Seleciona trilhas
    ├─ Clica "Salvar"
    │
    └─ API: PUT /api/admin/alunos/:id/trilhas
       ├─ Identifica trilhas a adicionar
       ├─ Identifica trilhas a remover
       ├─ DELETE antigas inscrições
       ├─ INSERT novas inscrições
       └─ Retorna resumo de mudanças
       
Resultado: Aluno agora tem acesso às novas trilhas ✅
```

### 3. Bloquear Aluno

```
Professor
    │
    ├─ Clica "Bloquear" em aluno
    ├─ Confirmação
    │
    └─ API: PUT /api/admin/alunos/:id/status
       ├─ UPDATE users SET ativo = FALSE
       └─ Retorna status atualizado
       
Resultado: 
  - Aluno ativo = false na tabela (com badge "Inativo")
  - Aluno não consegue fazer login
  - Dados preservados
```

### 4. Remover Aluno (Soft Delete)

```
Professor
    │
    ├─ Clica "Remover" em aluno
    ├─ Confirmação: "Tem certeza?"
    │
    └─ API: DELETE /api/admin/alunos/:id
       ├─ UPDATE users SET ativo = FALSE
       └─ Retorna mensagem de soft delete
       
Resultado:
  - Aluno desaparece da lista
  - Dados no banco: SELECT * FROM users WHERE id = 123
    → Ainda existe com ativo = false
```

### 5. Deletar Trilha/Módulo/Lição

```
Professor
    │
    ├─ Clica "Deletar" em trilha/módulo/lição
    ├─ Confirmação
    │
    └─ API: DELETE /api/trilhas|modulos|licoes/:id
       ├─ UPDATE [tabela] SET ativo = FALSE
       └─ Retorna mensagem de soft delete
       
Resultado:
  - Conteúdo desaparece da interface (filtro ativo = TRUE)
  - Dados preservados no banco
  - Progresso de alunos mantido
```

---

## Endpoints - Referência Rápida

### Administração de Alunos

| Método | Endpoint | Descrição | Requer |
|--------|----------|-----------|---------|
| POST | `/api/admin/alunos` | Criar aluno | Token, Professor |
| GET | `/api/admin/alunos` | Listar alunos | Token, Professor |
| GET | `/api/admin/alunos/:id` | Detalhes aluno | Token, Professor |
| PUT | `/api/admin/alunos/:id/status` | Bloquear/Desbloquear | Token, Professor |
| DELETE | `/api/admin/alunos/:id` | Soft delete aluno | Token, Professor |
| PUT | `/api/admin/alunos/:id/trilhas` | Editar acesso | Token, Professor |

### Soft Delete de Conteúdo

| Método | Endpoint | Descrição | Requer |
|--------|----------|-----------|---------|
| DELETE | `/api/trilhas/:id` | Soft delete trilha | Token, Professor |
| DELETE | `/api/modulos/:id` | Soft delete módulo | Token, Professor |
| DELETE | `/api/licoes/:id` | Soft delete lição | Token, Professor |

---

## Campos de Entrada

### Criar Aluno

```json
{
  "nome": "João Silva",           // Obrigatório, string
  "email": "joao@email.com",      // Obrigatório, único, válido
  "whatsapp": "+55 11 98765-4321", // Opcional, formatado
  "senha": "senha123456"          // Obrigatório, min 8 chars
}
```

### Editar Status

```json
{
  "ativo": false  // Obrigatório, boolean (true = ativo, false = bloqueado)
}
```

### Editar Trilhas

```json
{
  "trilhas_ids": [1, 2, 3]  // Obrigatório, array de IDs
}
```

---

## Responses

### Sucesso (201 Created)

```json
{
  "mensagem": "Aluno criado com sucesso",
  "aluno": {
    "id": 123,
    "email": "joao@email.com",
    "nome": "João Silva",
    "tipo": "aluno",
    "whatsapp": "+55 11 98765-4321",
    "ativo": true
  }
}
```

### Erro (400 Bad Request)

```json
{
  "erro": "Email já cadastrado"
}
```

### Erro (403 Forbidden)

```json
{
  "erro": "Acesso negado. Apenas professores."
}
```

### Erro (404 Not Found)

```json
{
  "erro": "Aluno não encontrado"
}
```

---

## Segurança

### Verificações Implementadas

```
┌─────────────────────────────────────────┐
│ Cada Request                            │
├─────────────────────────────────────────┤
│ 1. JWT válido?                          │ → 401 se inválido
│ 2. É professor?                         │ → 403 se não
│ 3. Dados válidos?                       │ → 400 se inválido
│ 4. Email único?                         │ → 400 se duplicado
│ 5. Senha forte?                         │ → 400 se < 8 chars
│ 6. Propriedade? (se aplicável)          │ → 403 se não é dono
└─────────────────────────────────────────┘
```

### Criptografia

```
Senha → bcrypt (10 rounds) → Hash armazenado no banco
Nunca transmitida em plain text
Nunca comparada com banco diretamente
```

---

## Testes - Exemplos Reais

### Criar Aluno

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3001/api/admin/alunos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "whatsapp": "+55 11 99999-9999",
    "senha": "senha123456"
  }'
```

**Response (201)**:
```json
{
  "mensagem": "Aluno criado com sucesso",
  "aluno": {
    "id": 456,
    "email": "maria@email.com",
    "nome": "Maria Silva",
    "tipo": "aluno",
    "whatsapp": "+55 11 99999-9999",
    "ativo": true
  }
}
```

### Listar com Busca

```bash
curl "http://localhost:3001/api/admin/alunos?busca=maria" \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200)**:
```json
[
  {
    "id": 456,
    "email": "maria@email.com",
    "nome": "Maria Silva",
    "whatsapp": "+55 11 99999-9999",
    "ativo": true,
    "criado_em": "2026-06-29T15:30:00Z",
    "total_trilhas": 2,
    "trilhas_ativas": 2
  }
]
```

### Bloquear Aluno

```bash
curl -X PUT http://localhost:3001/api/admin/alunos/456/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ativo": false}'
```

**Response (200)**:
```json
{
  "mensagem": "Aluno desativado com sucesso",
  "aluno": {
    "id": 456,
    "email": "maria@email.com",
    "nome": "Maria Silva",
    "ativo": false
  }
}
```

---

## Checklist de Deploy

- [ ] Executar migração 1: soft delete
- [ ] Executar migração 2: whatsapp
- [ ] Testar backend com curl
- [ ] Testar frontend interface
- [ ] Criar aluno de teste
- [ ] Bloquear aluno de teste
- [ ] Editar trilhas de teste
- [ ] Deletar aluno de teste (verificar soft delete)
- [ ] Verificar dados no banco
- [ ] Testar permissões (não professor)

---

## Arquivos Inclusos

### Backend
- `/backend/routes/admin-alunos.js` - Novos endpoints
- `/backend/routes/trilhas.js` - Modificado
- `/backend/routes/modulos.js` - Modificado
- `/backend/routes/licoes.js` - Modificado
- `/backend/server.js` - Modificado

### Frontend
- `/frontend/app/professor/alunos/page.js` - Nova página
- `/frontend/app/professor/trilha/[id]/page.js` - Modificado

### Database
- `/database/migrations/001_add_soft_delete.sql`
- `/database/migrations/002_add_whatsapp.sql`

### Documentação
- `IMPLEMENTACAO_FINALIZADA.md` - Guia completo
- `SISTEMA_GERENCIAMENTO_ALUNOS.md` - Referência técnica
- `CHECKLIST_IMPLEMENTACAO.md` - Status detalhado
- `TESTES_CURL.sh` - Script de testes automáticos
- `README_GERENCIAMENTO_ALUNOS.md` - Este arquivo

---

## Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| "Email já cadastrado" | Use outro email ou delete aluno anterior |
| "Acesso negado" | Faça login como professor |
| "Token inválido" | Obtenha novo token via `/api/auth/login` |
| "Aluno não aparece" | Verificar se `ativo = true` no banco |
| "Erro ao criar" | Verifique validation errors nos logs |
| Dados não restauram | Use `UPDATE users SET ativo = TRUE WHERE id = ...` |

---

## Performance

- Índices criados em colunas `ativo` para queries rápidas
- Paginação recomendada para > 1000 alunos
- Soft delete não impacta performance (filtro com índice)

---

## Compatibilidade

- Node.js 16+
- Next.js 14+
- PostgreSQL 12+
- Supabase compatible
- Browsers: Chrome 90+, Firefox 88+, Safari 14+

---

## Próximas Features (Roadmap)

- [ ] Paginação em listagem de alunos
- [ ] Exportar alunos em CSV
- [ ] Ativar/desativar múltiplos alunos
- [ ] Histórico de alterações
- [ ] Notificação por email ao criar aluno
- [ ] Reset de senha
- [ ] 2FA (two-factor authentication)

---

## Suporte

Consulte arquivos de documentação:
- **Dúvidas técnicas**: `SISTEMA_GERENCIAMENTO_ALUNOS.md`
- **Status de features**: `CHECKLIST_IMPLEMENTACAO.md`
- **Testes automáticos**: `bash TESTES_CURL.sh`
- **Guia completo**: `IMPLEMENTACAO_FINALIZADA.md`

---

**Sistema pronto para produção!** 🎉

Data: 2026-06-29 | Versão: 1.0.0 | Status: Production Ready
