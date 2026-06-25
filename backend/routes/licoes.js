import express from 'express';
import { pool } from '../server.js';
import { verificarJWT, verificarProfessor } from '../middleware/auth.js';

const router = express.Router();

// Listar lições de um módulo
router.get('/modulo/:modulo_id', verificarJWT, async (req, res) => {
  try {
    const { modulo_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM licoes WHERE modulo_id = $1 ORDER BY ordem ASC',
      [modulo_id]
    );

    res.json(result.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar lições' });
  }
});

// Get lição específica
router.get('/:id', verificarJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM licoes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Lição não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar lição' });
  }
});

// Criar lição (professor)
router.post('/', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { modulo_id, nome, descricao, video_url, ordem } = req.body;

    if (!modulo_id || !nome || !video_url) {
      return res.status(400).json({ erro: 'Módulo, nome e vídeo são obrigatórios' });
    }

    // Verificar se professor é dono
    const modulo = await pool.query(
      `SELECT m.* FROM modulos m
       INNER JOIN trilhas t ON m.trilha_id = t.id
       WHERE m.id = $1 AND t.criado_por_professor_id = $2`,
      [modulo_id, req.usuario_id]
    );

    if (modulo.rows.length === 0) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const result = await pool.query(
      'INSERT INTO licoes (modulo_id, nome, descricao, video_url, ordem, criado_em) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [modulo_id, nome, descricao || '', video_url, ordem || 1]
    );

    res.status(201).json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao criar lição' });
  }
});

// Editar lição (professor)
router.put('/:id', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, video_url, ordem } = req.body;

    const licao = await pool.query('SELECT * FROM licoes WHERE id = $1', [id]);

    if (licao.rows.length === 0) {
      return res.status(404).json({ erro: 'Lição não encontrada' });
    }

    // Verificar se professor é dono
    const modulo = await pool.query(
      `SELECT m.* FROM modulos m
       INNER JOIN trilhas t ON m.trilha_id = t.id
       WHERE m.id = $1 AND t.criado_por_professor_id = $2`,
      [licao.rows[0].modulo_id, req.usuario_id]
    );

    if (modulo.rows.length === 0) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const result = await pool.query(
      'UPDATE licoes SET nome = $1, descricao = $2, video_url = $3, ordem = $4, atualizado_em = NOW() WHERE id = $5 RETURNING *',
      [
        nome || licao.rows[0].nome,
        descricao !== undefined ? descricao : licao.rows[0].descricao,
        video_url || licao.rows[0].video_url,
        ordem || licao.rows[0].ordem,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao editar lição' });
  }
});

// Deletar lição (professor)
router.delete('/:id', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { id } = req.params;

    const licao = await pool.query('SELECT * FROM licoes WHERE id = $1', [id]);

    if (licao.rows.length === 0) {
      return res.status(404).json({ erro: 'Lição não encontrada' });
    }

    // Verificar se professor é dono
    const modulo = await pool.query(
      `SELECT m.* FROM modulos m
       INNER JOIN trilhas t ON m.trilha_id = t.id
       WHERE m.id = $1 AND t.criado_por_professor_id = $2`,
      [licao.rows[0].modulo_id, req.usuario_id]
    );

    if (modulo.rows.length === 0) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    await pool.query('DELETE FROM licoes WHERE id = $1', [id]);

    res.json({ mensagem: 'Lição deletada com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao deletar lição' });
  }
});

export default router;
