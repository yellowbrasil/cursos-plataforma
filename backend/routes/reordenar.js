import express from 'express';
import { pool } from '../server.js';
import { verificarJWT, verificarProfessor } from '../middleware/auth.js';

const router = express.Router();

// Reordenar lição (mover para cima/baixo)
router.put('/licao/:licao_id/:direcao', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { licao_id, direcao } = req.params;

    // Buscar lição
    const licaoResult = await pool.query('SELECT * FROM licoes WHERE id = $1', [licao_id]);
    if (licaoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Lição não encontrada' });
    }

    const licao = licaoResult.rows[0];
    const modulo_id = licao.modulo_id;

    // Verificar permissão (professor é dono do módulo)
    const moduloCheck = await pool.query(
      `SELECT m.* FROM modulos m
       INNER JOIN trilhas t ON m.trilha_id = t.id
       WHERE m.id = $1 AND t.criado_por_professor_id = $2`,
      [modulo_id, req.usuario_id]
    );

    if (moduloCheck.rows.length === 0) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    // Buscar todas as lições do módulo ordenadas
    const licoesResult = await pool.query(
      'SELECT * FROM licoes WHERE modulo_id = $1 ORDER BY ordem ASC',
      [modulo_id]
    );

    const licoes = licoesResult.rows;
    const indiceAtual = licoes.findIndex((l) => l.id === parseInt(licao_id));

    if (indiceAtual === -1) {
      return res.status(404).json({ erro: 'Lição não encontrada' });
    }

    if (direcao === 'cima' && indiceAtual === 0) {
      return res.status(400).json({ erro: 'Lição já está no topo' });
    }

    if (direcao === 'baixo' && indiceAtual === licoes.length - 1) {
      return res.status(400).json({ erro: 'Lição já está no final' });
    }

    // Trocar ordem
    let indiceProximo;
    if (direcao === 'cima') {
      indiceProximo = indiceAtual - 1;
    } else {
      indiceProximo = indiceAtual + 1;
    }

    const ordemAtual = licoes[indiceAtual].ordem;
    const ordemProxima = licoes[indiceProximo].ordem;

    // Atualizar ordens no banco
    await pool.query('UPDATE licoes SET ordem = $1 WHERE id = $2', [ordemProxima, licao_id]);
    await pool.query('UPDATE licoes SET ordem = $1 WHERE id = $2', [ordemAtual, licoes[indiceProximo].id]);

    // Buscar lições atualizadas
    const licoesAtualizadas = await pool.query(
      'SELECT * FROM licoes WHERE modulo_id = $1 ORDER BY ordem ASC',
      [modulo_id]
    );

    res.json(licoesAtualizadas.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao reordenar lição' });
  }
});

// Reordenar módulo (mover para cima/baixo)
router.put('/modulo/:modulo_id/:direcao', verificarJWT, verificarProfessor, async (req, res) => {
  try {
    const { modulo_id, direcao } = req.params;

    // Buscar módulo
    const moduloResult = await pool.query('SELECT * FROM modulos WHERE id = $1', [modulo_id]);
    if (moduloResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Módulo não encontrado' });
    }

    const modulo = moduloResult.rows[0];
    const trilha_id = modulo.trilha_id;

    // Verificar permissão
    const trilhaCheck = await pool.query(
      'SELECT * FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2',
      [trilha_id, req.usuario_id]
    );

    if (trilhaCheck.rows.length === 0) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    // Buscar todos os módulos da trilha
    const modulosResult = await pool.query(
      'SELECT * FROM modulos WHERE trilha_id = $1 ORDER BY ordem ASC',
      [trilha_id]
    );

    const modulos = modulosResult.rows;
    const indiceAtual = modulos.findIndex((m) => m.id === parseInt(modulo_id));

    if (indiceAtual === -1) {
      return res.status(404).json({ erro: 'Módulo não encontrado' });
    }

    if (direcao === 'cima' && indiceAtual === 0) {
      return res.status(400).json({ erro: 'Módulo já está no topo' });
    }

    if (direcao === 'baixo' && indiceAtual === modulos.length - 1) {
      return res.status(400).json({ erro: 'Módulo já está no final' });
    }

    // Trocar ordem
    let indiceProximo;
    if (direcao === 'cima') {
      indiceProximo = indiceAtual - 1;
    } else {
      indiceProximo = indiceAtual + 1;
    }

    const ordemAtual = modulos[indiceAtual].ordem;
    const ordemProxima = modulos[indiceProximo].ordem;

    // Atualizar ordens
    await pool.query('UPDATE modulos SET ordem = $1 WHERE id = $2', [ordemProxima, modulo_id]);
    await pool.query('UPDATE modulos SET ordem = $1 WHERE id = $2', [ordemAtual, modulos[indiceProximo].id]);

    // Retornar módulos atualizados
    const modulosAtualizados = await pool.query(
      'SELECT * FROM modulos WHERE trilha_id = $1 ORDER BY ordem ASC',
      [trilha_id]
    );

    res.json(modulosAtualizados.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao reordenar módulo' });
  }
});

export default router;
