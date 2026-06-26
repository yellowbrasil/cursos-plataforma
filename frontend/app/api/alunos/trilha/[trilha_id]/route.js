import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarProfessor } from '@/app/lib/auth';

export async function GET(req, { params }) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarProfessor(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas professores.' }, { status: 403 });
    }

    const { trilha_id } = params;

    const trilhaCheck = await pool.query(
      'SELECT * FROM trilhas WHERE id = $1 AND criado_por_professor_id = $2',
      [trilha_id, decoded.usuario_id]
    );

    if (trilhaCheck.rows.length === 0) {
      return NextResponse.json({ erro: 'Trilha não encontrada' }, { status: 403 });
    }

    const result = await pool.query(
      `SELECT i.*, u.nome, u.email FROM inscricoes i
       INNER JOIN users u ON i.aluno_id = u.id
       WHERE i.trilha_id = $1
       ORDER BY u.nome ASC`,
      [trilha_id]
    );

    return NextResponse.json(result.rows);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao listar alunos' }, { status: 500 });
  }
}
