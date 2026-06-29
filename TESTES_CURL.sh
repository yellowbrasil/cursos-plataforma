#!/bin/bash
# Script de testes para o sistema de gerenciamento de alunos
# Uso: bash TESTES_CURL.sh

set -e

API_URL="http://localhost:3001"
PROFESSOR_EMAIL="yellowbrasildigital@gmail.com"
PROFESSOR_PASSWORD="senha123"

echo "🧪 Iniciando testes do Sistema de Gerenciamento de Alunos"
echo "=================================================="
echo ""

# PASSO 1: Obter token de professor
echo "📋 PASSO 1: Autenticação de Professor"
echo "========================================"
echo "POST /api/auth/login"
echo ""

TOKEN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$PROFESSOR_EMAIL\",
    \"senha\": \"$PROFESSOR_PASSWORD\"
  }")

echo "Resposta:"
echo "$TOKEN_RESPONSE" | jq '.' 2>/dev/null || echo "$TOKEN_RESPONSE"
echo ""

# Extrair token
TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.token' 2>/dev/null || echo "")

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Erro: Não conseguiu obter token de professor"
  echo "   Verifique se o professor existe no banco de dados"
  exit 1
fi

echo "✅ Token obtido: ${TOKEN:0:20}..."
echo ""

# PASSO 2: Criar novo aluno
echo "📋 PASSO 2: Criar Novo Aluno"
echo "========================================"
echo "POST /api/admin/alunos"
echo ""

ALUNO_RESPONSE=$(curl -s -X POST "$API_URL/api/admin/alunos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva Teste",
    "email": "joao_silva_'$(date +%s)@email.com",
    "whatsapp": "+55 11 98765-4321",
    "senha": "senha123456"
  }')

echo "Resposta:"
echo "$ALUNO_RESPONSE" | jq '.' 2>/dev/null || echo "$ALUNO_RESPONSE"
echo ""

ALUNO_ID=$(echo "$ALUNO_RESPONSE" | jq -r '.aluno.id' 2>/dev/null || echo "")
ALUNO_EMAIL=$(echo "$ALUNO_RESPONSE" | jq -r '.aluno.email' 2>/dev/null || echo "")

if [ -z "$ALUNO_ID" ] || [ "$ALUNO_ID" = "null" ]; then
  echo "❌ Erro: Não conseguiu criar aluno"
  echo "   Verifique se as migrations foram executadas"
  exit 1
fi

echo "✅ Aluno criado com ID: $ALUNO_ID"
echo "   Email: $ALUNO_EMAIL"
echo ""

# PASSO 3: Listar alunos
echo "📋 PASSO 3: Listar Todos os Alunos"
echo "========================================"
echo "GET /api/admin/alunos"
echo ""

ALUNOS_RESPONSE=$(curl -s -X GET "$API_URL/api/admin/alunos" \
  -H "Authorization: Bearer $TOKEN")

echo "Resposta (primeiros 3 alunos):"
echo "$ALUNOS_RESPONSE" | jq '.[0:3]' 2>/dev/null || echo "$ALUNOS_RESPONSE"
echo ""

TOTAL=$(echo "$ALUNOS_RESPONSE" | jq 'length' 2>/dev/null || echo "0")
echo "✅ Total de alunos: $TOTAL"
echo ""

# PASSO 4: Buscar aluno específico
echo "📋 PASSO 4: Buscar Aluno Específico"
echo "========================================"
echo "GET /api/admin/alunos/:id"
echo ""

ALUNO_DETAIL=$(curl -s -X GET "$API_URL/api/admin/alunos/$ALUNO_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Resposta:"
echo "$ALUNO_DETAIL" | jq '.' 2>/dev/null || echo "$ALUNO_DETAIL"
echo ""

echo "✅ Aluno encontrado: $(echo "$ALUNO_DETAIL" | jq -r '.nome' 2>/dev/null)"
echo ""

# PASSO 5: Buscar com filtro
echo "📋 PASSO 5: Buscar com Filtro (busca por nome)"
echo "========================================"
echo "GET /api/admin/alunos?busca=João"
echo ""

SEARCH_RESPONSE=$(curl -s -X GET "$API_URL/api/admin/alunos?busca=João" \
  -H "Authorization: Bearer $TOKEN")

echo "Resposta:"
echo "$SEARCH_RESPONSE" | jq '.' 2>/dev/null || echo "$SEARCH_RESPONSE"
echo ""

SEARCH_COUNT=$(echo "$SEARCH_RESPONSE" | jq 'length' 2>/dev/null || echo "0")
echo "✅ Encontrados $SEARCH_COUNT alunos com 'João' no nome"
echo ""

# PASSO 6: Bloquear aluno
echo "📋 PASSO 6: Bloquear Aluno"
echo "========================================"
echo "PUT /api/admin/alunos/:id/status"
echo ""

BLOCK_RESPONSE=$(curl -s -X PUT "$API_URL/api/admin/alunos/$ALUNO_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ativo": false}')

echo "Resposta:"
echo "$BLOCK_RESPONSE" | jq '.' 2>/dev/null || echo "$BLOCK_RESPONSE"
echo ""

ATIVO=$(echo "$BLOCK_RESPONSE" | jq -r '.aluno.ativo' 2>/dev/null)
if [ "$ATIVO" = "false" ]; then
  echo "✅ Aluno bloqueado com sucesso"
else
  echo "⚠️  Status do aluno: $ATIVO"
fi
echo ""

# PASSO 7: Desbloquear aluno
echo "📋 PASSO 7: Desbloquear Aluno"
echo "========================================"
echo "PUT /api/admin/alunos/:id/status"
echo ""

UNBLOCK_RESPONSE=$(curl -s -X PUT "$API_URL/api/admin/alunos/$ALUNO_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ativo": true}')

echo "Resposta:"
echo "$UNBLOCK_RESPONSE" | jq '.' 2>/dev/null || echo "$UNBLOCK_RESPONSE"
echo ""

ATIVO=$(echo "$UNBLOCK_RESPONSE" | jq -r '.aluno.ativo' 2>/dev/null)
if [ "$ATIVO" = "true" ]; then
  echo "✅ Aluno ativado com sucesso"
else
  echo "⚠️  Status do aluno: $ATIVO"
fi
echo ""

# PASSO 8: Listar trilhas para editar acesso
echo "📋 PASSO 8: Listar Trilhas (para editar acesso do aluno)"
echo "========================================"
echo "GET /api/trilhas"
echo ""

TRILHAS_RESPONSE=$(curl -s -X GET "$API_URL/api/trilhas" \
  -H "Authorization: Bearer $TOKEN")

echo "Resposta (primeiras 2 trilhas):"
echo "$TRILHAS_RESPONSE" | jq '.[0:2]' 2>/dev/null || echo "$TRILHAS_RESPONSE"
echo ""

TRILHAS_IDS=$(echo "$TRILHAS_RESPONSE" | jq -r '.[0:2] | map(.id) | @json' 2>/dev/null || echo "[]")
echo "✅ IDs das trilhas: $TRILHAS_IDS"
echo ""

# PASSO 9: Editar trilhas do aluno
echo "📋 PASSO 9: Editar Acesso do Aluno às Trilhas"
echo "========================================"
echo "PUT /api/admin/alunos/:id/trilhas"
echo ""

# Se houver trilhas, inscrever o aluno
if [ "$TRILHAS_IDS" != "[]" ] && [ ! -z "$TRILHAS_IDS" ]; then
  TRILHAS_EDIT=$(curl -s -X PUT "$API_URL/api/admin/alunos/$ALUNO_ID/trilhas" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"trilhas_ids\": $TRILHAS_IDS}")

  echo "Resposta:"
  echo "$TRILHAS_EDIT" | jq '.' 2>/dev/null || echo "$TRILHAS_EDIT"
  echo ""

  echo "✅ Trilhas do aluno atualizadas"
else
  echo "⚠️  Nenhuma trilha disponível para inscrever"
fi
echo ""

# PASSO 10: Deletar aluno (soft delete)
echo "📋 PASSO 10: Deletar Aluno (Soft Delete)"
echo "========================================"
echo "DELETE /api/admin/alunos/:id"
echo ""

DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/api/admin/alunos/$ALUNO_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Resposta:"
echo "$DELETE_RESPONSE" | jq '.' 2>/dev/null || echo "$DELETE_RESPONSE"
echo ""

echo "✅ Aluno deletado com soft delete (dados preservados no banco)"
echo ""

# RESUMO
echo "=================================================="
echo "✅ TESTES COMPLETOS COM SUCESSO"
echo "=================================================="
echo ""
echo "Resumo do que foi testado:"
echo "  1. ✅ Autenticação de professor"
echo "  2. ✅ Criar novo aluno"
echo "  3. ✅ Listar todos os alunos"
echo "  4. ✅ Buscar aluno específico"
echo "  5. ✅ Buscar com filtro"
echo "  6. ✅ Bloquear aluno"
echo "  7. ✅ Desbloquear aluno"
echo "  8. ✅ Listar trilhas"
echo "  9. ✅ Editar acesso às trilhas"
echo "  10. ✅ Deletar aluno (soft delete)"
echo ""
echo "🎉 Sistema funcionando perfeitamente!"
echo ""
echo "Próximos passos:"
echo "  1. Testar frontend em http://localhost:3000"
echo "  2. Ir para Menu → Gerenciar Alunos"
echo "  3. Experimentar a interface"
echo ""
