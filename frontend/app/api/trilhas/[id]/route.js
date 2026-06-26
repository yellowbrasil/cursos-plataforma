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
    const { nome, descricao, sinopse, link_asaas, ordem } = await req.json();

    const trilha = await pool.query('SELECT * FROM trilhas WHERE id = $1', [id]);

    if (trilha.rows.length === 0) {
      return NextResponse.json({ erro: 'Trilha não encontrada' }, { status: 404 });
    }

    if (trilha.rows[0].criado_por_professor_id !== decoded.usuario_id) {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    const result = await pool.query(
      'UPDATE trilhas SET nome = $1, descricao = $2, sinopse = $3, ordem = $4, link_asaas = $5 WHERE id = $6 RETURNING *',
      [
        nome || trilha.rows[0].nome,
        descricao !== undefined ? descricao : trilha.rows[0].descricao,
        sinopse !== undefined ? sinopse : trilha.rows[0].sinopse,
        ordem || trilha.rows[0].ordem,
        link_asaas !== undefined ? link_asaas : trilha.rows[0].link_asaas,
        id
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao editar trilha' }, { status: 500 });
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

    const trilha = await pool.query('SELECT * FROM trilhas WHERE id = $1', [id]);

    if (trilha.rows.length === 0) {
      return NextResponse.json({ erro: 'Trilha não encontrada' }, { status: 404 });
    }

    if (trilha.rows[0].criado_por_professor_id !== decoded.usuario_id) {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    await pool.query('DELETE FROM trilhas WHERE id = $1', [id]);

    return NextResponse.json({ mensagem: 'Trilha deletada com sucesso' });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao deletar trilha' }, { status: 500 });
  }
}
