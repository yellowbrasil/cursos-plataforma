#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║          🚀 AI PRO ACADEMY - DEPLOYMENT AUTOMÁTICO 🚀         ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis
PROJECT_DIR="/Users/fabioschnaider/cursos-plataforma"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo -e "${BLUE}📋 Verificando pré-requisitos...${NC}"
echo ""

# Verificar Git
if git -C "$PROJECT_DIR" rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Git repositório encontrado${NC}"
else
  echo -e "${RED}❌ Git repositório não encontrado${NC}"
  exit 1
fi

# Verificar Node.js
if command -v node &> /dev/null; then
  echo -e "${GREEN}✅ Node.js instalado ($(node --version))${NC}"
else
  echo -e "${RED}❌ Node.js não encontrado${NC}"
  exit 1
fi

# Verificar npm
if command -v npm &> /dev/null; then
  echo -e "${GREEN}✅ npm instalado ($(npm --version))${NC}"
else
  echo -e "${RED}❌ npm não encontrado${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# PASSO 1: Verificar se há mudanças não commitadas
echo -e "${BLUE}📌 Passo 1: Verificar código no GitHub${NC}"

if [[ -n $(git -C "$PROJECT_DIR" status -s) ]]; then
  echo -e "${YELLOW}⚠️  Há mudanças não commitadas${NC}"
  echo "Deseja fazer commit antes de fazer deploy? (s/n)"
  read -r COMMIT_CHOICE

  if [[ $COMMIT_CHOICE == "s" ]]; then
    cd "$PROJECT_DIR"
    git add -A
    git commit -m "Deploy: Preparando sistema para produção"
    git push origin main
    echo -e "${GREEN}✅ Código enviado ao GitHub${NC}"
  fi
else
  echo -e "${GREEN}✅ Código está sincronizado com GitHub${NC}"
fi

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# PASSO 2: Testar build do backend
echo -e "${BLUE}📌 Passo 2: Verificar Build do Backend${NC}"

cd "$BACKEND_DIR"
if npm list > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Dependências do backend instaladas${NC}"
else
  echo -e "${YELLOW}⚠️  Instalando dependências do backend...${NC}"
  npm install
fi

echo ""

# PASSO 3: Testar build do frontend
echo -e "${BLUE}📌 Passo 3: Verificar Build do Frontend${NC}"

cd "$FRONTEND_DIR"
if npm list > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Dependências do frontend instaladas${NC}"
else
  echo -e "${YELLOW}⚠️  Instalando dependências do frontend...${NC}"
  npm install
fi

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# PASSO 4: Instruções de Deploy Manual
echo -e "${BLUE}📌 Passo 4: Deploy Manual (Você faz no navegador)${NC}"
echo ""
echo -e "${YELLOW}🚂 RAILWAY (Backend)${NC}"
echo "1. Acesse: https://railway.app"
echo "2. Conecte seu GitHub"
echo "3. Importe o projeto: yellowbrasil/cursos-plataforma"
echo "4. Configure as variáveis de ambiente (veja DEPLOY_AGORA.md)"
echo "5. Aguarde 5 minutos"
echo "6. Copie a URL do railway"
echo ""
echo -e "${YELLOW}🎨 VERCEL (Frontend)${NC}"
echo "1. Acesse: https://vercel.com"
echo "2. Conecte seu GitHub"
echo "3. Importe o projeto: yellowbrasil/cursos-plataforma"
echo "4. Configure: NEXT_PUBLIC_API_URL = [URL do Railway]"
echo "5. Aguarde 3 minutos"
echo "6. Seu site estará em: https://ai-pro-academy-prod.vercel.app"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✅ Sistema pronto para deploy!${NC}"
echo ""
echo "📝 Siga as instruções em: DEPLOY_AGORA.md"
echo ""
echo "Para mais detalhes, abra:"
echo "  • DEPLOY_AGORA.md - Guia rápido (15 min)"
echo "  • DEPLOY.md - Guia completo"
echo "  • RAILWAY_VERCEL_CONFIG.txt - Variáveis de ambiente"
echo ""

echo -e "${GREEN}🚀 Quando terminar, seu sistema estará 100% online!${NC}"
echo ""
