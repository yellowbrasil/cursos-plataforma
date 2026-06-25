import express from 'express';
import { pool } from '../server.js';
import { verificarJWT, verificarProfessor } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Listar materiais de uma lição
router.get('/licao/:licao_id', verificarJWT, async (req, res) => {
  try {
    const { licao_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM materiais WHERE licao_id = $1 ORDER BY criado_em ASC',
      [licao_id]
    );

    res.json(result.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar materiais' });
  }
});

// Adicionar material (professor) com upload
router.post('/', verificarJWT, verificarProfessor, upload.single('arquivo'), async (req, res) => {
  try {
    const { licao_id, nome } = req.body;

    if (!licao_id || !nome || !req.file) {
      return res.status(400).json({ erro: 'Lição, nome e arquivo são obrigatórios' });
    }

    const arquivo_url = `/uploads/${req.file.filename}`;
    const tipo = req.file.mimetype.includes('sheet') || req.file.mimetype.includes('excel') ? 'planilha' :
                  req.file.mimetype.includes('pdf') ? 'pdf' :
                  req.file.mimetype.includes('word') ? 'docs' : 'outro';
    const tamanho = req.file.size;

    // Verificar se professor é dono
    const licao = await pool.query(
      `SELECT l.* FROM licoes l
       INNER JOIN modulos m ON l.modulo_id = m.id
       INNER JOIN trilhas t ON m.trilha_id = t.id
       WHERE l.id = $1 AND t.criado_por_professor_id = $2`,
      [licao_id, req.usuario_id]
    );

    if (licao.rows.length === 0) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const result = await pool.query(
      'INSERT INTO materiais (licao_id, nome, arquivo_url, tipo, tamanho, criado_em) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [licao_id, nome, arquivo_url, tipo || 'pdf', tamanho || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao adicionar material' });
  }
});

// Deletar material (professor)
router.delete('/:id', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { id } = req.params;

    const material = await pool.query('SELECT * FROM materiais WHERE id = $1', [id]);

    if (material.rows.length === 0) {
      return res.status(404).json({ erro: 'Material não encontrado' });
    }

    // Verificar se professor é dono
    const licao = await pool.query(
      `SELECT l.* FROM licoes l
       INNER JOIN modulos m ON l.modulo_id = m.id
       INNER JOIN trilhas t ON m.trilha_id = t.id
       WHERE l.id = $1 AND t.criado_por_professor_id = $2`,
      [material.rows[0].licao_id, req.usuario_id]
    );

    if (licao.rows.length === 0) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    await pool.query('DELETE FROM materiais WHERE id = $1', [id]);

    res.json({ mensagem: 'Material deletado com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao deletar material' });
  }
});

export default router;
