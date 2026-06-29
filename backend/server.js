import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import authRoutes from './routes/auth.js';
import trilhasRoutes from './routes/trilhas.js';
import modulosRoutes from './routes/modulos.js';
import licoesRoutes from './routes/licoes.js';
import materiaisRoutes from './routes/materiais.js';
import progressoRoutes from './routes/progresso.js';
import inscricoesRoutes from './routes/inscricoes.js';
import reordenarRoutes from './routes/reordenar.js';
import alunosRoutes from './routes/alunos.js';
import configuracoesRoutes from './routes/configuracoes.js';
import adminAlunosRoutes from './routes/admin-alunos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS Seguro - Apenas domínios confiáveis
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://ai-pro-academy-prod.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// Database Pool
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trilhas', trilhasRoutes);
app.use('/api/modulos', modulosRoutes);
app.use('/api/licoes', licoesRoutes);
app.use('/api/materiais', materiaisRoutes);
app.use('/api/progresso', progressoRoutes);
app.use('/api/inscricoes', inscricoesRoutes);
app.use('/api/reordenar', reordenarRoutes);
app.use('/api/alunos', alunosRoutes);
app.use('/api/configuracoes', configuracoesRoutes);
app.use('/api/admin/alunos', adminAlunosRoutes);

// Servir arquivos de upload
app.use('/uploads', express.static('uploads'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
