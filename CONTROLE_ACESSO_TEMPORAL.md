# ● CONTROLE DE ACESSO TEMPORAL - DOCUMENTAÇÃO

## Visão Geral

Sistema de controle de acesso com duração individual por aluno. Professor define quantos dias cada aluno tem acesso a cada trilha no momento da inscrição.

---

## 📋 Banco de Dados

### Novas Colunas em `inscricoes`

| Coluna | Tipo | Padrão | Descrição |
|--------|------|--------|-----------|
| `duracao_dias` | INTEGER | 30 | Dias de acesso |
| `data_fim_acesso` | TIMESTAMP | NULL | Data de expiração (calculada) |
| `bloqueado_manualmente` | BOOLEAN | FALSE | Bloqueado pelo professor |
| `data_ultima_renovacao` | TIMESTAMP | NULL | Quando foi renovado |

### VIEW: `v_inscricoes_status`

Centraliza cálculos de status de acesso:

```sql
SELECT 
  id,
  aluno_id,
  trilha_id,
  status_acesso,  -- ativo | expirando_em_breve | expirado | bloqueado_manualmente
  dias_faltando   -- Dias até expiração (negativo se expirado)
FROM v_inscricoes_status;
```

---

## 🔌 APIs (Backend)

### 1. Inscrever Aluno com Duração

```http
PUT /api/acesso/inscrever/:aluno_id/trilha/:trilha_id
Authorization: Bearer {token}
Content-Type: application/json

{
  "duracao_dias": 30
}
```

**Resposta:**
```json
{
  "mensagem": "Aluno inscrito com sucesso",
  "inscricao": {
    "id": 1,
    "aluno_id": 4,
    "trilha_id": 1,
    "duracao_dias": 30,
    "data_inicio": "2026-06-30T20:00:00Z",
    "data_fim_acesso": "2026-07-30T20:00:00Z",
    "bloqueado_manualmente": false
  }
}
```

---

### 2. Bloquear Aluno Manualmente

```http
POST /api/acesso/:inscricao_id/bloquear
Authorization: Bearer {token}
```

**Uso:** Professor quer tirar acesso de um aluno imediatamente.

---

### 3. Desbloquear Aluno

```http
POST /api/acesso/:inscricao_id/desbloquear
Authorization: Bearer {token}
```

---

### 4. Renovar Acesso

```http
POST /api/acesso/:inscricao_id/renovar
Authorization: Bearer {token}
Content-Type: application/json

{
  "dias_adicionais": 30
}
```

**Quem pode chamar:**
- ✓ O próprio aluno
- ✓ Professor da trilha

**Resposta:**
```json
{
  "mensagem": "Acesso renovado com sucesso",
  "inscricao": {
    "data_fim_acesso": "2026-08-29T20:00:00Z",
    "duracao_dias": 60,
    "data_ultima_renovacao": "2026-06-30T20:05:00Z"
  }
}
```

---

### 5. Verificar Status (Com Aviso)

```http
GET /api/acesso/:inscricao_id/status
Authorization: Bearer {token}
```

**Resposta - Ativo:**
```json
{
  "status": "ativo",
  "dias_faltando": 28,
  "data_fim_acesso": "2026-07-29T17:48:45Z",
  "bloqueado_manualmente": false,
  "aviso": null
}
```

**Resposta - Expirando em Breve (≤15 dias):**
```json
{
  "status": "expirando_em_breve",
  "dias_faltando": 12,
  "data_fim_acesso": "2026-07-12T17:48:45Z",
  "bloqueado_manualmente": false,
  "aviso": "Seu acesso expira em 12 dias"
}
```

---

### 6. Listar Todas as Trilhas com Status

```http
GET /api/acesso/aluno/:aluno_id/status
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": 1,
    "aluno_id": 4,
    "trilha_id": 1,
    "trilha_nome": "Marketing Digital",
    "status_acesso": "ativo",
    "dias_faltando": 28,
    "data_fim_acesso": "2026-07-29T17:48:45Z",
    "bloqueado_manualmente": false
  },
  {
    "id": 2,
    "aluno_id": 4,
    "trilha_id": 2,
    "trilha_nome": "IA Avançada",
    "status_acesso": "expirando_em_breve",
    "dias_faltando": 10,
    "data_fim_acesso": "2026-07-10T18:12:31Z",
    "bloqueado_manualmente": false,
    "aviso": "Seu acesso expira em 10 dias"
  }
]
```

---

## 📊 Fluxo de Uso

### Cenário 1: Professor Inscreve Aluno

1. Professor vai para "Alunos" → Atribuir trilhas
2. Para cada aluno, define: Trilha + **Duração (dias)**
3. Sistema calcula `data_fim_acesso` automaticamente
4. Aluno recebe acesso por N dias

### Cenário 2: Aluno Vê Aviso de Expiração

1. Aluno acessa trilha (qualquer página)
2. Sistema verifica status via `/api/acesso/aluno/:id/status`
3. Se `status_acesso === 'expirando_em_breve'`, mostra notificação
4. Notificação mostra: "Seu acesso expira em 12 dias"
5. Botões: "Renovar Acesso" ou "Entendido"

### Cenário 3: Aluno Renova Acesso

1. Aluno clica "Renovar Acesso"
2. Sistema chama `POST /api/acesso/:inscricao_id/renovar`
3. Adiciona dias (professor define quantos → ex: 30 dias)
4. `data_fim_acesso` é atualizada
5. `data_ultima_renovacao` é registrada

### Cenário 4: Professor Bloqueia Aluno

1. Professor vai para lista de alunos
2. Clica "Bloquear" ao lado do aluno
3. Sistema chama `POST /api/acesso/:inscricao_id/bloquear`
4. Aluno perde acesso **imediatamente**

---

## 🔒 Segurança

- ✓ JWT obrigatório em todas as rotas
- ✓ Professor só gerencia trilhas que criou
- ✓ Aluno só renova sua própria inscrição
- ✓ SQL parametrizado (sem SQL injection)
- ✓ Validações de entrada rigorosas

---

## 📝 Exemplos de Integração Frontend

### Verificar Status Antes de Acessar Trilha

```javascript
const response = await axios.get(
  `/api/acesso/${inscricaoId}/status`,
  { headers: { Authorization: `Bearer ${token}` } }
);

const { status, dias_faltando, aviso } = response.data;

if (status === 'expirando_em_breve') {
  // Mostrar modal de aviso
  showModal({
    titulo: 'Seu acesso está expirando!',
    mensagem: aviso,
    botoes: ['Renovar Agora', 'Depois']
  });
}

if (status === 'expirado' || status === 'bloqueado_manualmente') {
  // Bloquear acesso à trilha
  return showBlockedPage();
}
```

### Renovar Acesso

```javascript
const response = await axios.post(
  `/api/acesso/${inscricaoId}/renovar`,
  { dias_adicionais: 30 },
  { headers: { Authorization: `Bearer ${token}` } }
);

showNotification('Acesso renovado com sucesso!');
```

---

## 🎯 Status Possíveis

| Status | Condição | Ação Necessária |
|--------|----------|-----------------|
| `ativo` | Dentro do prazo | Sem ação |
| `expirando_em_breve` | ≤ 15 dias restantes | Mostrar aviso |
| `expirado` | Passou da data | Bloquear acesso |
| `bloqueado_manualmente` | Professor bloqueou | Bloquear acesso |

---

## 📌 Notas Importantes

1. **Padrão:** Se professor não especifica duração, usa 30 dias
2. **Inscrições antigas:** Recebem 30 dias + data_inicio original
3. **Renovação:** Cada renovação registra quando aconteceu
4. **Compatibilidade:** Zero breaking changes - sistema antigo continua funcionando
5. **Performance:** Índice em `data_fim_acesso` otimiza buscas

---

## 🧪 Testes Recomendados

- [ ] Inscrever aluno com 30 dias
- [ ] Verificar status (deve ser "ativo")
- [ ] Esperar 16 dias, verificar status (deve ser "expirando_em_breve")
- [ ] Aluno renova com 30 dias
- [ ] Bloquear aluno manualmente
- [ ] Desbloquear aluno
- [ ] Listar todas trilhas com status

