#!/bin/bash

set -e

echo "🚀 Iniciando setup da Plataforma de Cursos..."

# Setup Backend
echo ""
echo "📦 Setup Backend..."
cd backend

if [ ! -f .env ]; then
  echo "  Criando .env do backend..."
  cp .env.example .env
  echo "  ✅ .env criado (ajuste as credenciais do banco)"
fi

if [ ! -d node_modules ]; then
  echo "  Instalando dependências..."
  npm install
  echo "  ✅ Dependências instaladas"
fi

cd ..

# Setup Frontend
echo ""
echo "🎨 Setup Frontend..."
cd frontend

if [ ! -f .env.local ]; then
  echo "  Criando .env.local do frontend..."
  cp .env.example .env.local
  echo "  ✅ .env.local criado"
fi

if [ ! -d node_modules ]; then
  echo "  Instalando dependências..."
  npm install
  echo "  ✅ Dependências instaladas"
fi

cd ..

echo ""
echo "✅ Setup completo!"
echo ""
echo "📍 Próximos passos:"
echo "  1. Ajuste .env do backend com credenciais do PostgreSQL"
echo "  2. Execute: psql -U postgres -f database/schema.sql"
echo "  3. Execute: npm run dev (em ./backend)"
echo "  4. Execute: npm run dev (em ./frontend)"
echo ""
echo "Acesse: http://localhost:3002"
