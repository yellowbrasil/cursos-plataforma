import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarProfessor } from '@/app/lib/auth';

export async function POST(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarProfessor(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas professores.' }, { status: 403 });
    }

    const { aluno_id, trilha_id } = await req.json();

    if (!aluno_id || !trilha_id) {
      return NextResponse.json({ erro: 'Aluno e trilha são obrigatórios' }, { status: 400 });
    }

    const trilhaCheck = await pool.query(
      'SELECT * FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2',
      [trilha_id, decoded.usuario_id]
    );

    if (trilhaCheck.rows.length === 0) {
      return NextResponse.json({ erro: 'Trilha não encontrada' }, { status: 403 });
    }

    const jaInscrito = await pool.query(
      'SELECT * FROM inscricoes WHERE aluno_id = $1 AND trilha_id = $2',
      [aluno_id, trilha_id]
    );

    if (jaInscrito.rows.length > 0) {
      return NextResponse.json({ erro: 'Aluno já está inscrito' }, { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO inscricoes (aluno_id, trilha_id, bloqueado) VALUES ($1, $2, FALSE) RETURNING *',
      [aluno_id, trilha_id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao inscrever aluno' }, { status: 500 });
  }
}
