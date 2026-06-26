import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarProfessor } from '@/app/lib/auth';

export async function GET(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarProfessor(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas professores.' }, { status: 403 });
    }

    const result = await pool.query(
      "SELECT id, email, nome FROM users WHERE tipo = 'aluno' ORDER BY nome ASC"
    );
    return NextResponse.json(result.rows);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao listar alunos' }, { status: 500 });
  }
}
