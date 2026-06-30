import express from 'express';
import { pool } from '../server.js';
import { verificarJWT, verificarProfessor, verificarAluno } from '../middleware/auth.js';

const router = express.Router();

// PUT - Inscrever aluno com duração personalizada
router.put('/inscrever/:aluno_id/trilha/:trilha_id', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { aluno_id, trilha_id } = req.params;
    const { duracao_dias } = req.body;

    if (!duracao_dias || duracao_dias < 1) {
      return res.status(400).json({ erro: 'duracao_dias deve ser >= 1' });
    }

    // Verificar se aluno existe
    const alunoCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND tipo = $2',
      [aluno_id, 'aluno']
    );
    if (alunoCheck.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    // Verificar se trilha existe e pertence ao professor
    const trilhaCheck = await pool.query(
      'SELECT id FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2 AND ativo = TRUE',
      [trilha_id, req.usuario_id]
    );
    if (trilhaCheck.rows.length === 0) {
      return res.status(404).json({ erro: 'Trilha não encontrada ou acesso negado' });
    }

    // Calcular data de fim de acesso
    const dataFimAcesso = new Date();
    dataFimAcesso.setDate(dataFimAcesso.getDate() + duracao_dias);

    // Inscrever ou atualizar inscrição
    const result = await pool.query(
      `INSERT INTO inscricoes (aluno_id, trilha_id, duracao_dias, data_inicio, data_fim_acesso, bloqueado_manualmente)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, FALSE)
       ON CONFLICT (aluno_id, trilha_id)
       DO UPDATE SET
         duracao_dias = $3,
         data_inicio = CURRENT_TIMESTAMP,
         data_fim_acesso = $4,
         bloqueado_manualmente = FALSE,
         data_ultima_renovacao = NULL
       RETURNING *`,
      [aluno_id, trilha_id, duracao_dias, dataFimAcesso]
    );

    res.json({
      mensagem: 'Aluno inscrito com sucesso',
      inscricao: result.rows[0]
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao inscrever aluno' });
  }
});

// POST - Bloquear aluno manualmente
router.post('/:inscricao_id/bloquear', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { inscricao_id } = req.params;

    // Verificar se inscrição existe e pertence a trilha do professor
    const inscricaoCheck = await pool.query(
      `SELECT i.* FROM inscricoes i
       INNER JOIN trilhas t ON i.trilha_id = t.id
       WHERE i.id = $1 AND t.criado_por_professor_id = $2`,
      [inscricao_id, req.usuario_id]
    );

    if (inscricaoCheck.rows.length === 0) {
      return res.status(404).json({ erro: 'Inscrição não encontrada ou acesso negado' });
    }

    // Bloquear
    const result = await pool.query(
      'UPDATE inscricoes SET bloqueado_manualmente = TRUE, bloqueado = TRUE WHERE id = $1 RETURNING *',
      [inscricao_id]
    );

    res.json({
      mensagem: 'Aluno bloqueado com sucesso',
      inscricao: result.rows[0]
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao bloquear aluno' });
  }
});

// POST - Desbloquear aluno
router.post('/:inscricao_id/desbloquear', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { inscricao_id } = req.params;

    // Verificar permissão
    const inscricaoCheck = await pool.query(
      `SELECT i.* FROM inscricoes i
       INNER JOIN trilhas t ON i.trilha_id = t.id
       WHERE i.id = $1 AND t.criado_por_professor_id = $2`,
      [inscricao_id, req.usuario_id]
    );

    if (inscricaoCheck.rows.length === 0) {
      return res.status(404).json({ erro: 'Inscrição não encontrada ou acesso negado' });
    }

    // Desbloquear
    const result = await pool.query(
      'UPDATE inscricoes SET bloqueado_manualmente = FALSE, bloqueado = FALSE WHERE id = $1 RETURNING *',
      [inscricao_id]
    );

    res.json({
      mensagem: 'Aluno desbloqueado com sucesso',
      inscricao: result.rows[0]
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao desbloquear aluno' });
  }
});

// POST - Renovar acesso (aluno ou professor)
router.post('/:inscricao_id/renovar', verificarJWT, async (req, res) => {
  try {
    const { inscricao_id } = req.params;
    const { dias_adicionais } = req.body;

    if (!dias_adicionais || dias_adicionais < 1) {
      return res.status(400).json({ erro: 'dias_adicionais deve ser >= 1' });
    }

    // Buscar inscrição
    const inscricaoCheck = await pool.query(
      'SELECT * FROM inscricoes WHERE id = $1',
      [inscricao_id]
    );

    if (inscricaoCheck.rows.length === 0) {
      return res.status(404).json({ erro: 'Inscrição não encontrada' });
    }

    const inscricao = inscricaoCheck.rows[0];

    // Verificar permissão: é o aluno desta inscrição OU professor da trilha
    const trilhaCheck = await pool.query(
      'SELECT criado_por_professor_id FROM trilhas WHERE id = $1',
      [inscricao.trilha_id]
    );

    const isAluno = req.tipo_usuario === 'aluno' && req.usuario_id === inscricao.aluno_id;
    const isProfessor = req.tipo_usuario === 'professor' && trilhaCheck.rows[0].criado_por_professor_id === req.usuario_id;

    if (!isAluno && !isProfessor) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    // Calcular nova data de fim
    const novaDataFim = new Date(inscricao.data_fim_acesso);
    novaDataFim.setDate(novaDataFim.getDate() + dias_adicionais);

    // Atualizar
    const result = await pool.query(
      `UPDATE inscricoes
       SET data_fim_acesso = $1,
           data_ultima_renovacao = CURRENT_TIMESTAMP,
           duracao_dias = duracao_dias + $2
       WHERE id = $3
       RETURNING *`,
      [novaDataFim, dias_adicionais, inscricao_id]
    );

    res.json({
      mensagem: 'Acesso renovado com sucesso',
      inscricao: result.rows[0]
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao renovar acesso' });
  }
});

// GET - Status de acesso da inscrição (com aviso se expirando)
router.get('/:inscricao_id/status', verificarJWT, async (req, res) => {
  try {
    const { inscricao_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM v_inscricoes_status WHERE id = $1`,
      [inscricao_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Inscrição não encontrada' });
    }

    const status = result.rows[0];

    // Determinar se deve mostrar aviso
    const aviso = status.status_acesso === 'expirando_em_breve'
      ? `Seu acesso expira em ${status.dias_faltando} dias`
      : null;

    res.json({
      status: status.status_acesso,
      dias_faltando: status.dias_faltando,
      data_fim_acesso: status.data_fim_acesso,
      bloqueado_manualmente: status.bloqueado_manualmente,
      aviso
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao verificar status' });
  }
});

// GET - Lista de inscrições do aluno com status
router.get('/aluno/:aluno_id/status', verificarJWT, async (req, res) => {
  try {
    const { aluno_id } = req.params;

    // Verificar permissão: é o próprio aluno ou professor
    if (req.tipo_usuario === 'aluno' && req.usuario_id !== parseInt(aluno_id)) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const result = await pool.query(
      `SELECT vs.*, t.nome as trilha_nome
       FROM v_inscricoes_status vs
       INNER JOIN trilhas t ON vs.trilha_id = t.id
       WHERE vs.aluno_id = $1
       ORDER BY vs.data_fim_acesso ASC`,
      [aluno_id]
    );

    res.json(result.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar status de acesso' });
  }
});

export default router;
