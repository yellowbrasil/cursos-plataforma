import bcrypt from 'bcryptjs';
import { pool } from './server.js';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  try {
    console.log('🌱 Inserindo dados de teste...');

    // Senha: senha123
    const senhaHash = await bcrypt.hash('senha123', 10);

    // Professor - usuário principal
    await pool.query(
      'INSERT INTO users (email, senha_hash, nome, tipo) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
      ['yellowbrasildigital@gmail.com', senhaHash, 'Admin - AI Pro Academy', 'professor']
    );

    // Aluno de teste
    await pool.query(
      'INSERT INTO users (email, senha_hash, nome, tipo) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
      ['aluno@teste.com', senhaHash, 'Aluno Teste', 'aluno']
    );

    console.log('✅ Dados de teste inseridos!');
    console.log('');
    console.log('📧 Login:');
    console.log('  Email: professor@teste.com ou aluno@teste.com');
    console.log('  Senha: senha123');

    process.exit(0);
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    process.exit(1);
  }
}

seed();
