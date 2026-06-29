import express from 'express';
import { pool } from '../server.js';
import { verificarJWT, verificarProfessor } from '../middleware/auth.js';
import { uploadImagem } from '../middleware/uploadImagem.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Listar trilhas (professor vê suas, aluno vê inscritas)
router.get('/', verificarJWT, async (req, res) => {
  try {
    let query, params;

    if (req.tipo_usuario === 'professor') {
      query = 'SELECT * FROM trilhas WHERE criado_por_professor_id = $1 AND ativo = TRUE ORDER BY ordem ASC';
      params = [req.usuario_id];
    } else {
      query = `
        SELECT t.* FROM trilhas t
        INNER JOIN inscricoes i ON t.id = i.trilha_id
        WHERE i.aluno_id = $1 AND i.bloqueado = FALSE AND t.ativo = TRUE
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

// Listar todas as trilhas com status de inscrição (para alunos)
router.get('/com-status/todas', verificarJWT, async (req, res) => {
  try {
    // Se for professor, retorna erro
    if (req.tipo_usuario === 'professor') {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const query = `
      SELECT
        t.*,
        CASE
          WHEN i.id IS NOT NULL AND i.bloqueado = FALSE THEN 'inscrito'
          WHEN i.id IS NOT NULL AND i.bloqueado = TRUE THEN 'bloqueado'
          ELSE 'nao_inscrito'
        END as status_inscricao
      FROM trilhas t
      LEFT JOIN inscricoes i ON t.id = i.trilha_id AND i.aluno_id = $1
      WHERE t.ativo = TRUE
      ORDER BY t.ordem ASC
    `;

    const result = await pool.query(query, [req.usuario_id]);
    res.json(result.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar trilhas' });
  }
});

// Criar trilha (professor) com upload de imagem
router.post('/', verificarJWT, verificarProfessor, uploadImagem.single('imagem'), async (req, res) => {
  try {
    const { nome, descricao, sinopse, link_asaas, ordem } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: 'Nome da trilha é obrigatório' });
    }

    const imagem_url = req.file ? `/uploads/imagens/${req.file.filename}` : null;

    const result = await pool.query(
      'INSERT INTO trilhas (nome, descricao, sinopse, ordem, imagem_url, link_asaas, criado_por_professor_id, criado_em) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [nome, descricao || '', sinopse || '', ordem || 1, imagem_url, link_asaas || '', req.usuario_id]
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
    const { nome, descricao, sinopse, link_asaas, ordem } = req.body;

    const trilha = await pool.query('SELECT * FROM trilhas WHERE id = $1', [id]);

    if (trilha.rows.length === 0) {
      return res.status(404).json({ erro: 'Trilha não encontrada' });
    }

    if (trilha.rows[0].criado_por_professor_id !== req.usuario_id) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const imagem_url = req.file ? `/uploads/imagens/${req.file.filename}` : trilha.rows[0].imagem_url;

    const result = await pool.query(
      'UPDATE trilhas SET nome = $1, descricao = $2, sinopse = $3, ordem = $4, imagem_url = $5, link_asaas = $6 WHERE id = $7 RETURNING *',
      [
        nome || trilha.rows[0].nome,
        descricao !== undefined ? descricao : trilha.rows[0].descricao,
        sinopse !== undefined ? sinopse : trilha.rows[0].sinopse,
        ordem || trilha.rows[0].ordem,
        imagem_url,
        link_asaas !== undefined ? link_asaas : trilha.rows[0].link_asaas,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao editar trilha' });
  }
});

// Deletar trilha (professor) - Soft Delete
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

    // Soft delete - apenas marca como inativo
    const result = await pool.query(
      'UPDATE trilhas SET ativo = FALSE WHERE id = $1 RETURNING id, nome',
      [id]
    );

    res.json({
      mensagem: 'Trilha removida com sucesso (soft delete)',
      trilha: result.rows[0]
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao deletar trilha' });
  }
});

// Get imagem da trilha (público)
router.get('/:id/imagem', async (req, res) => {
  try {
    const { id } = req.params;

    const trilha = await pool.query('SELECT imagem_url FROM trilhas WHERE id = $1', [id]);

    if (trilha.rows.length === 0 || !trilha.rows[0].imagem_url) {
      return res.status(404).json({ erro: 'Imagem não encontrada' });
    }

    const imagemUrl = trilha.rows[0].imagem_url;
    const caminhoRelativo = imagemUrl.replace('/uploads/', '');
    const caminhoCompleto = path.resolve('./uploads', caminhoRelativo);

    if (!fs.existsSync(caminhoCompleto)) {
      return res.status(404).json({ erro: 'Arquivo não encontrado' });
    }

    res.sendFile(caminhoCompleto, (err) => {
      if (err) console.error('Erro ao servir imagem:', err);
    });
  } catch (erro) {
    console.error('Erro ao servir imagem da trilha:', erro);
    res.status(500).json({ erro: 'Erro ao servir imagem' });
  }
});

export default router;
