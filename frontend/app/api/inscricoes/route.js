import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarAluno } from '@/app/lib/auth';

export async function POST(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarAluno(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas alunos.' }, { status: 403 });
    }

    const { trilha_id } = await req.json();
    const aluno_id = decoded.usuario_id;

    if (!trilha_id) {
      return NextResponse.json({ erro: 'ID da trilha é obrigatório' }, { status: 400 });
    }

    const trilhaExists = await pool.query('SELECT * FROM trilhas WHERE id = $1', [trilha_id]);
    if (trilhaExists.rows.length === 0) {
      return NextResponse.json({ erro: 'Trilha não encontrada' }, { status: 404 });
    }

    const jaInscrito = await pool.query(
      'SELECT * FROM inscricoes WHERE aluno_id = $1 AND trilha_id = $2',
      [aluno_id, trilha_id]
    );

    if (jaInscrito.rows.length > 0) {
      return NextResponse.json({ erro: 'Você já está inscrito nesta trilha' }, { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO inscricoes (aluno_id, trilha_id, data_inicio) VALUES ($1, $2, NOW()) RETURNING *',
      [aluno_id, trilha_id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao inscrever-se na trilha' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const aluno_id = searchParams.get('aluno_id');

    if (!aluno_id) {
      return NextResponse.json({ erro: 'aluno_id é obrigatório' }, { status: 400 });
    }

    if (decoded.usuario_id !== parseInt(aluno_id) && decoded.tipo !== 'admin') {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    const result = await pool.query(
      `SELECT i.*, t.nome as trilha_nome, t.descricao as trilha_descricao
       FROM inscricoes i
       INNER JOIN trilhas t ON i.trilha_id = t.id
       WHERE i.aluno_id = $1
       ORDER BY i.data_inicio DESC`,
      [aluno_id]
    );

    return NextResponse.json(result.rows);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao listar inscrições' }, { status: 500 });
  }
}
