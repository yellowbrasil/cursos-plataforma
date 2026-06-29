import express from 'express';
import { pool } from '../server.js';
import { verificarJWT, verificarProfessor } from '../middleware/auth.js';

const router = express.Router();

// Listar todos os alunos do sistema (professor vê)
router.get('/', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, nome FROM users WHERE tipo = 'aluno' ORDER BY nome ASC"
    );
    res.json(result.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar alunos' });
  }
});

// Inscrever aluno em trilha (professor faz)
router.post('/inscrever', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { aluno_id, trilha_id } = req.body;

    if (!aluno_id || !trilha_id) {
      return res.status(400).json({ erro: 'Aluno e trilha são obrigatórios' });
    }

    // Verificar se trilha pertence ao professor
    const trilhaCheck = await pool.query(
      'SELECT * FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2',
      [trilha_id, req.usuario_id]
    );

    if (trilhaCheck.rows.length === 0) {
      return res.status(403).json({ erro: 'Trilha não encontrada' });
    }

    // Verificar se aluno já está inscrito
    const jaInscrito = await pool.query(
      'SELECT * FROM inscricoes WHERE aluno_id = $1 AND trilha_id = $2',
      [aluno_id, trilha_id]
    );

    if (jaInscrito.rows.length > 0) {
      return res.status(400).json({ erro: 'Aluno já está inscrito' });
    }

    // Inscrever
    const result = await pool.query(
      'INSERT INTO inscricoes (aluno_id, trilha_id, bloqueado) VALUES ($1, $2, FALSE) RETURNING *',
      [aluno_id, trilha_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao inscrever aluno' });
  }
});

// Bloquear aluno em trilha
router.put('/bloquear/:inscricao_id', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { inscricao_id } = req.params;
    const { data_desbloqueio } = req.body;

    // Verificar se inscrição existe e pertence ao professor
    const inscricaoResult = await pool.query(
      `SELECT i.* FROM inscricoes i
       INNER JOIN trilhas t ON i.trilha_id = t.id
       WHERE i.id = $1 AND t.criado_por_professor_id = $2`,
      [inscricao_id, req.usuario_id]
    );

    if (inscricaoResult.rows.length === 0) {
      return res.status(403).json({ erro: 'Inscrição não encontrada' });
    }

    const result = await pool.query(
      'UPDATE inscricoes SET bloqueado = TRUE, data_desbloqueio = $1 WHERE id = $2 RETURNING *',
      [data_desbloqueio || null, inscricao_id]
    );

    res.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao bloquear aluno' });
  }
});

// Desbloquear aluno
router.put('/desbloquear/:inscricao_id', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { inscricao_id } = req.params;

    const inscricaoResult = await pool.query(
      `SELECT i.* FROM inscricoes i
       INNER JOIN trilhas t ON i.trilha_id = t.id
       WHERE i.id = $1 AND t.criado_por_professor_id = $2`,
      [inscricao_id, req.usuario_id]
    );

    if (inscricaoResult.rows.length === 0) {
      return res.status(403).json({ erro: 'Inscrição não encontrada' });
    }

    const result = await pool.query(
      'UPDATE inscricoes SET bloqueado = FALSE, data_desbloqueio = NULL WHERE id = $1 RETURNING *',
      [inscricao_id]
    );

    res.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao desbloquear aluno' });
  }
});

// Listar alunos de uma trilha (inscritos)
router.get('/trilha/:trilha_id', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { trilha_id } = req.params;

    // Verificar se trilha pertence ao professor
    const trilhaCheck = await pool.query(
      'SELECT * FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2',
      [trilha_id, req.usuario_id]
    );

    if (trilhaCheck.rows.length === 0) {
      return res.status(403).json({ erro: 'Trilha não encontrada' });
    }

    const result = await pool.query(
      `SELECT i.*, u.nome, u.email FROM inscricoes i
       INNER JOIN users u ON i.aluno_id = u.id
       WHERE i.trilha_id = $1
       ORDER BY u.nome ASC`,
      [trilha_id]
    );

    res.json(result.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar alunos' });
  }
});

// Remover inscrição

export default router;
