import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../server.js';
import { verificarJWT } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'desenvolvimento_seguro_2026_fabio_schneider_cursos';

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    const usuario = result.rows[0];

    if (!usuario.ativo) {
      return res.status(403).json({ erro: 'Usuário desativado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    const token = jwt.sign(
      { usuario_id: usuario.id, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
      },
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// Trocar Senha
router.put('/mudar-senha', verificarJWT, async (req, res) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    const usuario_id = req.usuario_id;

    if (!senha_atual || !nova_senha) {
      return res.status(400).json({ erro: 'Senhas são obrigatórias' });
    }

    if (nova_senha.length < 8) {
      return res.status(400).json({ erro: 'Nova senha deve ter mínimo 8 caracteres' });
    }

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [usuario_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha_atual, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha atual incorreta' });
    }

    const novaHashSenha = await bcrypt.hash(nova_senha, 10);

    await pool.query('UPDATE users SET senha_hash = $1 WHERE id = $2', [
      novaHashSenha,
      usuario_id,
    ]);

    res.json({ mensagem: 'Senha alterada com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao alterar senha' });
  }
});

// Get Perfil
router.get('/perfil', verificarJWT, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, nome, tipo FROM users WHERE id = $1',
      [req.usuario_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
});

export default router;
