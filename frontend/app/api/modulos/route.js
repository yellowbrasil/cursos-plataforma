import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarProfessor } from '@/app/lib/auth';

export async function GET(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const trilha_id = searchParams.get('trilha_id');

    if (!trilha_id) {
      return NextResponse.json({ erro: 'trilha_id é obrigatório' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT * FROM modulos WHERE trilha_id = $1 ORDER BY ordem ASC',
      [trilha_id]
    );

    return NextResponse.json(result.rows);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao listar módulos' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarProfessor(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas professores.' }, { status: 403 });
    }

    const { trilha_id, nome, descricao, ordem } = await req.json();

    if (!trilha_id || !nome) {
      return NextResponse.json({ erro: 'Trilha e nome são obrigatórios' }, { status: 400 });
    }

    const trilha = await pool.query(
      'SELECT * FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2',
      [trilha_id, decoded.usuario_id]
    );

    if (trilha.rows.length === 0) {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    const result = await pool.query(
      'INSERT INTO modulos (trilha_id, nome, descricao, ordem) VALUES ($1, $2, $3, $4) RETURNING *',
      [trilha_id, nome, descricao || '', ordem || 1]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao criar módulo' }, { status: 500 });
  }
}
