#!/bin/bash

echo "🚀 Iniciando AI PRO ACADEMY..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
  echo "❌ Node.js não instalado"
  exit 1
fi

# Parar processos antigos
pkill -f "npm start" || true
pkill -f "npm run dev" || true
sleep 2

# Criar logs directory
mkdir -p logs

echo "📌 Iniciando Backend (porta 3001)..."
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"
sleep 3

cd ..

echo "📌 Iniciando Frontend (porta 3002)..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"
sleep 3

cd ..

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ AI PRO ACADEMY INICIADO"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Frontend:  http://localhost:3002"
echo "⚙️  Backend:   http://localhost:3001"
echo ""
echo "📧 Login: yellowbrasildigital@gmail.com"
echo "🔐 Senha: senha123"
echo ""
echo "📋 Logs:"
echo "   Backend:  ./logs/backend.log"
echo "   Frontend: ./logs/frontend.log"
echo ""
echo "⏹️  Para parar: pkill -f 'npm start\|npm run dev'"
echo ""

# Keep script running
wait
