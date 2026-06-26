import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarProfessor } from '@/app/lib/auth';

export async function PUT(req, { params }) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarProfessor(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas professores.' }, { status: 403 });
    }

    const { licao_id, direcao } = params;

    const licaoResult = await pool.query('SELECT * FROM licoes WHERE id = $1', [licao_id]);
    if (licaoResult.rows.length === 0) {
      return NextResponse.json({ erro: 'Lição não encontrada' }, { status: 404 });
    }

    const licao = licaoResult.rows[0];
    const modulo_id = licao.modulo_id;

    const moduloCheck = await pool.query(
      `SELECT m.* FROM modulos m
       INNER JOIN trilhas t ON m.trilha_id = t.id
       WHERE m.id = $1 AND t.criado_por_professor_id = $2`,
      [modulo_id, decoded.usuario_id]
    );

    if (moduloCheck.rows.length === 0) {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    const licoesResult = await pool.query(
      'SELECT * FROM licoes WHERE modulo_id = $1 ORDER BY ordem ASC',
      [modulo_id]
    );

    const licoes = licoesResult.rows;
    const indiceAtual = licoes.findIndex((l) => l.id === parseInt(licao_id));

    if (indiceAtual === -1) {
      return NextResponse.json({ erro: 'Lição não encontrada' }, { status: 404 });
    }

    if (direcao === 'cima' && indiceAtual === 0) {
      return NextResponse.json({ erro: 'Lição já está no topo' }, { status: 400 });
    }

    if (direcao === 'baixo' && indiceAtual === licoes.length - 1) {
      return NextResponse.json({ erro: 'Lição já está no final' }, { status: 400 });
    }

    let indiceProximo;
    if (direcao === 'cima') {
      indiceProximo = indiceAtual - 1;
    } else {
      indiceProximo = indiceAtual + 1;
    }

    const ordemAtual = licoes[indiceAtual].ordem;
    const ordemProxima = licoes[indiceProximo].ordem;

    await pool.query('UPDATE licoes SET ordem = $1 WHERE id = $2', [ordemProxima, licao_id]);
    await pool.query('UPDATE licoes SET ordem = $1 WHERE id = $2', [ordemAtual, licoes[indiceProximo].id]);

    const licoesAtualizadas = await pool.query(
      'SELECT * FROM licoes WHERE modulo_id = $1 ORDER BY ordem ASC',
      [modulo_id]
    );

    return NextResponse.json(licoesAtualizadas.rows);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao reordenar lição' }, { status: 500 });
  }
}
