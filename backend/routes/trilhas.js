import express from 'express';
import { pool } from '../server.js';
import { verificarJWT, verificarProfessor } from '../middleware/auth.js';
import { uploadImagem } from '../middleware/uploadImagem.js';

const router = express.Router();

// Listar trilhas (professor vê suas, aluno vê inscritas)
router.get('/', verificarJWT, async (req, res) => {
  try {
    let query, params;

    if (req.tipo_usuario === 'professor') {
      query = 'SELECT * FROM trilhas WHERE criado_por_professor_id = $1 ORDER BY ordem ASC';
      params = [req.usuario_id];
    } else {
      query = `
        SELECT t.* FROM trilhas t
        INNER JOIN inscricoes i ON t.id = i.trilha_id
        WHERE i.aluno_id = $1 AND i.bloqueado = FALSE
        ORDER BY t.ordem ASC
      `;
      params = [req.usuario_id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar trilhas' });
  }
});

// Criar trilha (professor) com upload de imagem
router.post('/', verificarJWT, verificarProfessor, uploadImagem.single('imagem'), async (req, res) => {
  try {
    const { nome, descricao, sinopse, ordem } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: 'Nome da trilha é obrigatório' });
    }

    const imagem_url = req.file ? `/uploads/imagens/${req.file.filename}` : null;

    const result = await pool.query(
      'INSERT INTO trilhas (nome, descricao, sinopse, ordem, imagem_url, criado_por_professor_id, criado_em) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [nome, descricao || '', sinopse || '', ordem || 1, imagem_url, req.usuario_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao criar trilha' });
  }
});

// Editar trilha (professor)
router.put('/:id', verificarJWT, verificarProfessor, uploadImagem.single('imagem'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, sinopse, ordem } = req.body;

    const trilha = await pool.query('SELECT * FROM trilhas WHERE id = $1', [id]);

    if (trilha.rows.length === 0) {
      return res.status(404).json({ erro: 'Trilha não encontrada' });
    }

    if (trilha.rows[0].criado_por_professor_id !== req.usuario_id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const imagem_url = req.file ? `/uploads/imagens/${req.file.filename}` : trilha.rows[0].imagem_url;

    const result = await pool.query(
      'UPDATE trilhas SET nome = $1, descricao = $2, sinopse = $3, ordem = $4, imagem_url = $5 WHERE id = $6 RETURNING *',
      [
        nome || trilha.rows[0].nome,
        descricao !== undefined ? descricao : trilha.rows[0].descricao,
        sinopse !== undefined ? sinopse : trilha.rows[0].sinopse,
        ordem || trilha.rows[0].ordem,
        imagem_url,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao editar trilha' });
  }
});

// Deletar trilha (professor)
router.delete('/:id', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { id } = req.params;

    const trilha = await pool.query('SELECT * FROM trilhas WHERE id = $1', [id]);

    if (trilha.rows.length === 0) {
      return res.status(404).json({ erro: 'Trilha não encontrada' });
    }

    if (trilha.rows[0].criado_por_professor_id !== req.usuario_id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    await pool.query('DELETE FROM trilhas WHERE id = $1', [id]);

    res.json({ mensagem: 'Trilha deletada com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao deletar trilha' });
  }
});

export default router;
