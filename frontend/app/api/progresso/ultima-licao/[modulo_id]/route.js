import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarAluno } from '@/app/lib/auth';

export async function GET(req, { params }) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarAluno(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas alunos.' }, { status: 403 });
    }

    const { modulo_id } = params;
    const aluno_id = decoded.usuario_id;

    const result = await pool.query(
      `SELECT pl.* FROM progresso_licoes pl
       INNER JOIN licoes l ON pl.licao_id = l.id
       WHERE pl.aluno_id = $1 AND l.modulo_id = $2
       ORDER BY pl.data_ultima_acesso DESC
       LIMIT 1`,
      [aluno_id, modulo_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao buscar última lição' }, { status: 500 });
  }
}
