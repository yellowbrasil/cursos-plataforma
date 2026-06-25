import express from 'express';
import { pool } from '../server.js';
import { verificarJWT, verificarAluno } from '../middleware/auth.js';

const router = express.Router();

// Atualizar progresso da lição
router.post('/licao/:licao_id', verificarJWT, verificarAluno, async (req, res) => {
  try {
    const { licao_id } = req.params;
    const { tempo_gasto_minutos, concluido } = req.body;
    const aluno_id = req.usuario_id;

    // Verificar se já existe
    const existe = await pool.query(
      'SELECT * FROM progresso_licoes WHERE aluno_id = $1 AND licao_id = $2',
      [aluno_id, licao_id]
    );

    if (existe.rows.length > 0) {
      const result = await pool.query(
        `UPDATE progresso_licoes
         SET data_ultima_acesso = NOW(), tempo_gasto_minutos = $1, concluido = $2
         WHERE aluno_id = $3 AND licao_id = $4
         RETURNING *`,
        [tempo_gasto_minutos || 0, concluido || false, aluno_id, licao_id]
      );

      return res.json(result.rows[0]);
    }

    // Criar novo
    const result = await pool.query(
      `INSERT INTO progresso_licoes (aluno_id, licao_id, data_ultima_acesso, tempo_gasto_minutos, concluido)
       VALUES ($1, $2, NOW(), $3, $4)
       RETURNING *`,
      [aluno_id, licao_id, tempo_gasto_minutos || 0, concluido || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao atualizar progresso' });
  }
});

// Get última lição acessada em um módulo
router.get('/ultima-licao/:modulo_id', verificarJWT, verificarAluno, async (req, res) => {
  try {
    const { modulo_id } = req.params;
    const aluno_id = req.usuario_id;

    const result = await pool.query(
      `SELECT pl.* FROM progresso_licoes pl
       INNER JOIN licoes l ON pl.licao_id = l.id
       WHERE pl.aluno_id = $1 AND l.modulo_id = $2
       ORDER BY pl.data_ultima_acesso DESC
       LIMIT 1`,
      [aluno_id, modulo_id]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar última lição' });
  }
});

// Get progresso total de uma trilha
router.get('/trilha/:trilha_id', verificarJWT, verificarAluno, async (req, res) => {
  try {
    const { trilha_id } = req.params;
    const aluno_id = req.usuario_id;

    const result = await pool.query(
      `SELECT
        COUNT(DISTINCT l.id) as total_licoes,
        COUNT(DISTINCT CASE WHEN pl.concluido THEN l.id END) as licoes_concluidas
       FROM modulos m
       INNER JOIN licoes l ON m.id = l.modulo_id
       LEFT JOIN progresso_licoes pl ON l.id = pl.licao_id AND pl.aluno_id = $2
       WHERE m.trilha_id = $1`,
      [trilha_id, aluno_id]
    );

    res.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar progresso' });
  }
});

export default router;
