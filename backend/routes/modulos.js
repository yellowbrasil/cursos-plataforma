import express from 'express';
import { pool } from '../server.js';
import { verificarJWT, verificarProfessor } from '../middleware/auth.js';

const router = express.Router();

// Listar módulos de uma trilha
router.get('/trilha/:trilha_id', verificarJWT, async (req, res) => {
  try {
    const { trilha_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM modulos WHERE trilha_id = $1 ORDER BY ordem ASC',
      [trilha_id]
    );

    res.json(result.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar módulos' });
  }
});

// Criar módulo (professor)
router.post('/', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { trilha_id, nome, descricao, ordem } = req.body;

    if (!trilha_id || !nome) {
      return res.status(400).json({ erro: 'Trilha e nome são obrigatórios' });
    }

    // Verificar se professor é dono da trilha
    const trilha = await pool.query(
      'SELECT * FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2',
      [trilha_id, req.usuario_id]
    );

    if (trilha.rows.length === 0) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const result = await pool.query(
      'INSERT INTO modulos (trilha_id, nome, descricao, ordem) VALUES ($1, $2, $3, $4) RETURNING *',
      [trilha_id, nome, descricao || '', ordem || 1]
    );

    res.status(201).json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao criar módulo' });
  }
});

// Editar módulo (professor)
router.put('/:id', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ordem } = req.body;

    const modulo = await pool.query('SELECT * FROM modulos WHERE id = $1', [id]);

    if (modulo.rows.length === 0) {
      return res.status(404).json({ erro: 'Módulo não encontrado' });
    }

    const trilha = await pool.query(
      'SELECT * FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2',
      [modulo.rows[0].trilha_id, req.usuario_id]
    );

    if (trilha.rows.length === 0) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const result = await pool.query(
      'UPDATE modulos SET nome = $1, descricao = $2, ordem = $3 WHERE id = $4 RETURNING *',
      [nome || modulo.rows[0].nome, descricao !== undefined ? descricao : modulo.rows[0].descricao, ordem || modulo.rows[0].ordem, id]
    );

    res.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao editar módulo' });
  }
});

// Deletar módulo (professor)
router.delete('/:id', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { id } = req.params;

    const modulo = await pool.query('SELECT * FROM modulos WHERE id = $1', [id]);

    if (modulo.rows.length === 0) {
      return res.status(404).json({ erro: 'Módulo não encontrado' });
    }

    const trilha = await pool.query(
      'SELECT * FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2',
      [modulo.rows[0].trilha_id, req.usuario_id]
    );

    if (trilha.rows.length === 0) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    await pool.query('DELETE FROM modulos WHERE id = $1', [id]);

    res.json({ mensagem: 'Módulo deletado com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao deletar módulo' });
  }
});

export default router;
