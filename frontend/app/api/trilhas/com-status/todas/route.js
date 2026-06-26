import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT } from '@/app/lib/auth';

export async function GET(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (decoded.tipo === 'professor') {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    const query = `
      SELECT
        t.*,
        CASE
          WHEN i.id IS NOT NULL AND i.bloqueado = FALSE THEN 'inscrito'
          WHEN i.id IS NOT NULL AND i.bloqueado = TRUE THEN 'bloqueado'
          ELSE 'nao_inscrito'
        END as status_inscricao
      FROM trilhas t
      LEFT JOIN inscricoes i ON t.id = i.trilha_id AND i.aluno_id = $1
      ORDER BY t.ordem ASC
    `;

    const result = await pool.query(query, [decoded.usuario_id]);
    return NextResponse.json(result.rows);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao listar trilhas' }, { status: 500 });
  }
}
