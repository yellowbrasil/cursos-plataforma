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

    const { inscricao_id } = params;
    const { data_desbloqueio } = await req.json();

    const inscricaoResult = await pool.query(
      `SELECT i.* FROM inscricoes i
       INNER JOIN trilhas t ON i.trilha_id = t.id
       WHERE i.id = $1 AND t.criado_por_professor_id = $2`,
      [inscricao_id, decoded.usuario_id]
    );

    if (inscricaoResult.rows.length === 0) {
      return NextResponse.json({ erro: 'Inscrição não encontrada' }, { status: 403 });
    }

    const result = await pool.query(
      'UPDATE inscricoes SET bloqueado = TRUE, data_desbloqueio = $1 WHERE id = $2 RETURNING *',
      [data_desbloqueio || null, inscricao_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao bloquear aluno' }, { status: 500 });
  }
}
