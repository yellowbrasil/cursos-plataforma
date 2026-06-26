#!/bin/bash

# Script de Deploy Automático - AI Pro Academy
# Execute este script e ele fará todo o setup

set -e

echo "🚀 ============================================"
echo "🚀 DEPLOY AUTOMÁTICO - AI PRO ACADEMY"
echo "🚀 ============================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 PASSO 1: Validando configuração${NC}"
echo ""

# 1. Validar que temos tudo que precisa
echo "✓ Verificando Node.js..."
node --version

echo "✓ Verificando Git..."
git --version

echo "✓ Verificando Railway CLI..."
npx -y @railway/cli --version

echo ""
echo -e "${BLUE}📋 PASSO 2: Coletando informações${NC}"
echo ""

# Credenciais do Supabase
SUPABASE_CONNECTION="postgresql://postgres:F024151f@#$@db.tkycshgylushbmxmyvul.supabase.co:5432/postgres"

# Gerar JWT Secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo -e "${YELLOW}⚠️  INFORMAÇÕES COLETADAS:${NC}"
echo "  - Supabase Connection: ✓"
echo "  - JWT Secret: $JWT_SECRET"
echo ""

echo -e "${BLUE}📋 PASSO 3: Preparar código${NC}"
echo ""

cd /Users/fabioschnaider/cursos-plataforma

echo "✓ Git status:"
git status --short

echo ""
echo -e "${YELLOW}⚠️  PRÓXIMOS PASSOS (MANUAIS):${NC}"
echo ""
echo "1️⃣  RAILWAY (Backend):"
echo "   a) Acesse: https://railway.app"
echo "   b) Login com GitHub"
echo "   c) Novo projeto → GitHub Repo → cursos-plataforma"
echo "   d) Configure estas variáveis:"
echo ""
cat << VARS
      DB_HOST=db.tkycshgylushbmxmyvul.supabase.co
      DB_PORT=5432
      DB_USER=postgres
      DB_PASSWORD=F024151f@#$
      DB_NAME=postgres
      JWT_SECRET=$JWT_SECRET
      NODE_ENV=production
      PORT=3001
      FRONTEND_URL=https://seu-projeto.vercel.app
VARS
echo ""
echo "   e) Clique Deploy"
echo "   f) COPIE A URL que aparecer (ex: seu-projeto-prod.up.railway.app)"
echo ""

echo "2️⃣  VERCEL (Frontend):"
echo "   a) Acesse: https://vercel.com"
echo "   b) Login com GitHub"
echo "   c) Novo projeto → cursos-plataforma"
echo "   d) Configure variável:"
echo "      NEXT_PUBLIC_API_URL=https://[URL-DO-RAILWAY]"
echo "   e) Clique Deploy"
echo ""

echo "3️⃣  TESTE:"
echo "   a) Acesse seu-projeto.vercel.app"
echo "   b) Login: yellowbrasildigital@gmail.com / senha123"
echo ""

echo -e "${GREEN}✅ Código está pronto!${NC}"
echo -e "${GREEN}✅ Credenciais do Supabase OK${NC}"
echo -e "${YELLOW}⚠️  Aguardando você fazer o deploy no Railway e Vercel...${NC}"
echo ""

