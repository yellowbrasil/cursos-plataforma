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

    const { id } = params;
    const { nome, descricao, ordem } = await req.json();

    const modulo = await pool.query('SELECT * FROM modulos WHERE id = $1', [id]);

    if (modulo.rows.length === 0) {
      return NextResponse.json({ erro: 'Módulo não encontrado' }, { status: 404 });
    }

    const trilha = await pool.query(
      'SELECT * FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2',
      [modulo.rows[0].trilha_id, decoded.usuario_id]
    );

    if (trilha.rows.length === 0) {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    const result = await pool.query(
      'UPDATE modulos SET nome = $1, descricao = $2, ordem = $3 WHERE id = $4 RETURNING *',
      [
        nome || modulo.rows[0].nome,
        descricao !== undefined ? descricao : modulo.rows[0].descricao,
        ordem || modulo.rows[0].ordem,
        id
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao editar módulo' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarProfessor(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas professores.' }, { status: 403 });
    }

    const { id } = params;

    const modulo = await pool.query('SELECT * FROM modulos WHERE id = $1', [id]);

    if (modulo.rows.length === 0) {
      return NextResponse.json({ erro: 'Módulo não encontrado' }, { status: 404 });
    }

    const trilha = await pool.query(
      'SELECT * FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2',
      [modulo.rows[0].trilha_id, decoded.usuario_id]
    );

    if (trilha.rows.length === 0) {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    await pool.query('DELETE FROM modulos WHERE id = $1', [id]);

    return NextResponse.json({ mensagem: 'Módulo deletado com sucesso' });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao deletar módulo' }, { status: 500 });
  }
}
