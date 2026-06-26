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

    const { trilha_id } = params;
    const aluno_id = decoded.usuario_id;

    const result = await pool.query(
      `SELECT
        COUNT(DISTINCT l.id) as total_licoes,
        COUNT(DISTINCT CASE WHEN pl.concluido THEN l.id END) as licoes_concluidas
       FROM modulos m
       INNER JOIN licoes l ON m.id = l.modulo_id
       LEFT JOIN progresso_licoes pl ON l.id = pl.licao_id AND pl.aluno_id = $2
       WHERE m.trilha_id = $1`,
      [trilha_id, aluno_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao buscar progresso' }, { status: 500 });
  }
}
