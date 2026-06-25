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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Database Pool
export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cursos_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
