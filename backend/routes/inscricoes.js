import express from 'express';
import { pool } from '../server.js';
import { verificarJWT, verificarAluno } from '../middleware/auth.js';

const router = express.Router();

// Inscrever aluno em trilha
router.post('/', verificarJWT, verificarAluno, async (req, res) => {
  try {
    const { trilha_id } = req.body;
    const aluno_id = req.usuario_id;

    if (!trilha_id) {
      return res.status(400).json({ erro: 'ID da trilha é obrigatório' });
    }

    // Verificar se trilha existe
    const trilhaExists = await pool.query('SELECT * FROM trilhas WHERE id = $1', [trilha_id]);
    if (trilhaExists.rows.length === 0) {
      return res.status(404).json({ erro: 'Trilha não encontrada' });
    }

    // Verificar se já está inscrito
    const jaInscrito = await pool.query(
      'SELECT * FROM inscricoes WHERE aluno_id = $1 AND trilha_id = $2',
      [aluno_id, trilha_id]
    );

    if (jaInscrito.rows.length > 0) {
      return res.status(400).json({ erro: 'Você já está inscrito nesta trilha' });
    }

    // Criar inscrição
    const result = await pool.query(
      'INSERT INTO inscricoes (aluno_id, trilha_id, data_inicio) VALUES ($1, $2, NOW()) RETURNING *',
      [aluno_id, trilha_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao inscrever-se na trilha' });
  }
});

// Listar inscrições do aluno
router.get('/aluno/:aluno_id', verificarJWT, async (req, res) => {
  try {
    const { aluno_id } = req.params;

    // Verificar permissão (só pode ver suas próprias inscrições ou ser admin)
    if (req.usuario_id !== parseInt(aluno_id) && req.tipo_usuario !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const result = await pool.query(
      `SELECT i.*, t.nome as trilha_nome, t.descricao as trilha_descricao
       FROM inscricoes i
       INNER JOIN trilhas t ON i.trilha_id = t.id
       WHERE i.aluno_id = $1
       ORDER BY i.data_inicio DESC`,
      [aluno_id]
    );

    res.json(result.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar inscrições' });
  }
});

// Deletar inscrição (desinscrever)
router.delete('/:id', verificarJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const inscricao = await pool.query('SELECT * FROM inscricoes WHERE id = $1', [id]);

    if (inscricao.rows.length === 0) {
      return res.status(404).json({ erro: 'Inscrição não encontrada' });
    }

    // Verificar permissão
    if (req.usuario_id !== inscricao.rows[0].aluno_id && req.tipo_usuario !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    await pool.query('DELETE FROM inscricoes WHERE id = $1', [id]);

    res.json({ mensagem: 'Desinscrição realizada com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao deletar inscrição' });
  }
});

export default router;
