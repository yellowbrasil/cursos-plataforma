#!/bin/bash

set -e

echo "🚀 Iniciando Plataforma de Cursos..."
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale Docker Desktop em: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker encontrado"

# Iniciar banco de dados
echo ""
echo "📦 Iniciando PostgreSQL..."
docker-compose up -d postgres

echo "⏳ Aguardando banco de dados ficar pronto..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL pronto!"
        break
    fi
    echo -n "."
    sleep 1
done

# Instalar dependências (se necessário)
echo ""
echo "📦 Instalando dependências..."

if [ ! -d "backend/node_modules" ]; then
    echo "  Backend..."
    cd backend
    npm install > /dev/null 2>&1
    cd ..
    echo "  ✅ Backend pronto"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "  Frontend..."
    cd frontend
    npm install > /dev/null 2>&1
    cd ..
    echo "  ✅ Frontend pronto"
fi

echo ""
echo "✅ Sistema pronto!"
echo ""
echo "📍 Iniciando serviços..."
echo ""

# Iniciar backend e frontend em paralelo
cd backend
npm run dev &
BACKEND_PID=$!

cd ../frontend
npm run dev &
FRONTEND_PID=$!

cd ..

echo "🎉 Tudo rodando!"
echo ""
echo "📱 Acesse: http://localhost:3002"
echo ""
echo "Login de teste:"
echo "  Email: professor@teste.com ou aluno@teste.com"
echo "  Senha: senha123"
echo ""
echo "Para parar: pressione Ctrl+C"

# Aguardar
wait
