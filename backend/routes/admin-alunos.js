import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../server.js';
import { verificarJWT, verificarProfessor } from '../middleware/auth.js';

const router = express.Router();

// POST - Criar novo aluno (professor)
router.post('/', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { nome, email, whatsapp, senha } = req.body;

    // Validar campos obrigatórios
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }

    // Validar email
    if (!email.includes('@')) {
      return res.status(400).json({ erro: 'Email inválido' });
    }

    // Validar senha (mínimo 8 caracteres)
    if (senha.length < 8) {
      return res.status(400).json({ erro: 'Senha deve ter mínimo 8 caracteres' });
    }

    // Verificar se email já existe
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Validar WhatsApp (apenas números e +)
    if (whatsapp && !/^\+?[0-9\s()-]+$/.test(whatsapp)) {
      return res.status(400).json({ erro: 'WhatsApp inválido' });
    }

    // Inserir novo aluno
    const result = await pool.query(
      'INSERT INTO users (email, senha_hash, nome, tipo, whatsapp, ativo, criado_em) VALUES ($1, $2, $3, $4, $5, TRUE, NOW()) RETURNING id, email, nome, tipo, whatsapp, ativo',
      [email, senhaHash, nome, 'aluno', whatsapp || null]
    );

    res.status(201).json({
      mensagem: 'Aluno criado com sucesso',
      aluno: result.rows[0]
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao criar aluno' });
  }
});

// GET - Listar todos os alunos com status
router.get('/', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { busca } = req.query;

    let query = `
      SELECT
        u.id,
        u.email,
        u.nome,
        u.whatsapp,
        u.ativo,
        u.criado_em,
        COUNT(DISTINCT i.trilha_id) as total_trilhas,
        COUNT(DISTINCT CASE WHEN i.bloqueado = FALSE THEN i.trilha_id END) as trilhas_ativas
      FROM users u
      LEFT JOIN inscricoes i ON u.id = i.aluno_id
      WHERE u.tipo = 'aluno'
    `;

    const params = [];

    // Filtro de busca (nome ou email)
    if (busca) {
      query += ` AND (u.nome ILIKE $1 OR u.email ILIKE $1)`;
      params.push(`%${busca}%`);
    }

    query += ` GROUP BY u.id ORDER BY u.criado_em DESC`;

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar alunos' });
  }
});

// GET - Detalhes de um aluno
router.get('/:id', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, email, nome, whatsapp, ativo, criado_em FROM users WHERE id = $1 AND tipo = $2',
      [id, 'aluno']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    // Buscar inscrições do aluno
    const inscricoes = await pool.query(
      `SELECT i.*, t.nome as trilha_nome FROM inscricoes i
       INNER JOIN trilhas t ON i.trilha_id = t.id
       WHERE i.aluno_id = $1 AND t.ativo = TRUE
       ORDER BY t.nome ASC`,
      [id]
    );

    const aluno = result.rows[0];
    aluno.trilhas = inscricoes.rows;

    res.json(aluno);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar aluno' });
  }
});

// PUT - Bloquear/Desbloquear aluno
router.put('/:id/status', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    if (ativo === undefined) {
      return res.status(400).json({ erro: 'Campo "ativo" é obrigatório' });
    }

    const result = await pool.query(
      'UPDATE users SET ativo = $1 WHERE id = $2 AND tipo = $3 RETURNING id, email, nome, ativo',
      [ativo, id, 'aluno']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    const mensagem = ativo ? 'Aluno ativado com sucesso' : 'Aluno desativado com sucesso';

    res.json({
      mensagem,
      aluno: result.rows[0]
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao atualizar status do aluno' });
  }
});

// DELETE - Soft delete de aluno
router.delete('/:id', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete - apenas marca como inativo
    const result = await pool.query(
      'UPDATE users SET ativo = FALSE WHERE id = $1 AND tipo = $2 RETURNING id, email, nome',
      [id, 'aluno']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    res.json({
      mensagem: 'Aluno removido com sucesso (soft delete)',
      aluno: result.rows[0]
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao remover aluno' });
  }
});

// PUT - Editar trilhas de um aluno (inscrição/desinscricão)
router.put('/:id/trilhas', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { id } = req.params;
    const { trilhas_ids } = req.body;

    if (!Array.isArray(trilhas_ids)) {
      return res.status(400).json({ erro: 'trilhas_ids deve ser um array' });
    }

    // Verificar se aluno existe
    const alunoCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND tipo = $2',
      [id, 'aluno']
    );

    if (alunoCheck.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    // Obter inscrições atuais
    const inscricoesAtuais = await pool.query(
      'SELECT trilha_id FROM inscricoes WHERE aluno_id = $1',
      [id]
    );

    const trilhasAtuais = inscricoesAtuais.rows.map(r => r.trilha_id);

    // Trilhas a remover (que estão em trilhasAtuais mas não em trilhas_ids)
    const trilhasRemover = trilhasAtuais.filter(t => !trilhas_ids.includes(t));

    // Trilhas a adicionar (que estão em trilhas_ids mas não em trilhasAtuais)
    const trilhasAdicionar = trilhas_ids.filter(t => !trilhasAtuais.includes(t));

    // Remover inscrições (soft delete - deletar registro)
    if (trilhasRemover.length > 0) {
      await pool.query(
        'DELETE FROM inscricoes WHERE aluno_id = $1 AND trilha_id = ANY($2)',
        [id, trilhasRemover]
      );
    }

    // Adicionar novas inscrições
    for (const trilhaId of trilhasAdicionar) {
      await pool.query(
        'INSERT INTO inscricoes (aluno_id, trilha_id, bloqueado) VALUES ($1, $2, FALSE) ON CONFLICT DO NOTHING',
        [id, trilhaId]
      );
    }

    res.json({
      mensagem: 'Trilhas do aluno atualizadas com sucesso',
      trilhas_adicionadas: trilhasAdicionar,
      trilhas_removidas: trilhasRemover
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao atualizar trilhas do aluno' });
  }
});

export default router;
