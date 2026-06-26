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

    const { modulo_id, direcao } = params;

    const moduloResult = await pool.query('SELECT * FROM modulos WHERE id = $1', [modulo_id]);
    if (moduloResult.rows.length === 0) {
      return NextResponse.json({ erro: 'Módulo não encontrado' }, { status: 404 });
    }

    const modulo = moduloResult.rows[0];
    const trilha_id = modulo.trilha_id;

    const trilhaCheck = await pool.query(
      'SELECT * FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2',
      [trilha_id, decoded.usuario_id]
    );

    if (trilhaCheck.rows.length === 0) {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    const modulosResult = await pool.query(
      'SELECT * FROM modulos WHERE trilha_id = $1 ORDER BY ordem ASC',
      [trilha_id]
    );

    const modulos = modulosResult.rows;
    const indiceAtual = modulos.findIndex((m) => m.id === parseInt(modulo_id));

    if (indiceAtual === -1) {
      return NextResponse.json({ erro: 'Módulo não encontrado' }, { status: 404 });
    }

    if (direcao === 'cima' && indiceAtual === 0) {
      return NextResponse.json({ erro: 'Módulo já está no topo' }, { status: 400 });
    }

    if (direcao === 'baixo' && indiceAtual === modulos.length - 1) {
      return NextResponse.json({ erro: 'Módulo já está no final' }, { status: 400 });
    }

    let indiceProximo;
    if (direcao === 'cima') {
      indiceProximo = indiceAtual - 1;
    } else {
      indiceProximo = indiceAtual + 1;
    }

    const ordemAtual = modulos[indiceAtual].ordem;
    const ordemProxima = modulos[indiceProximo].ordem;

    await pool.query('UPDATE modulos SET ordem = $1 WHERE id = $2', [ordemProxima, modulo_id]);
    await pool.query('UPDATE modulos SET ordem = $1 WHERE id = $2', [ordemAtual, modulos[indiceProximo].id]);

    const modulosAtualizados = await pool.query(
      'SELECT * FROM modulos WHERE trilha_id = $1 ORDER BY ordem ASC',
      [trilha_id]
    );

    return NextResponse.json(modulosAtualizados.rows);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao reordenar módulo' }, { status: 500 });
  }
}
