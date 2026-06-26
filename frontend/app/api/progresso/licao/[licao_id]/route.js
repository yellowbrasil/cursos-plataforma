import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarAluno } from '@/app/lib/auth';

export async function POST(req, { params }) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarAluno(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas alunos.' }, { status: 403 });
    }

    const { licao_id } = params;
    const { tempo_gasto_minutos, concluido } = await req.json();
    const aluno_id = decoded.usuario_id;

    const existe = await pool.query(
      'SELECT * FROM progresso_licoes WHERE aluno_id = $1 AND licao_id = $2',
      [aluno_id, licao_id]
    );

    if (existe.rows.length > 0) {
      const result = await pool.query(
        `UPDATE progresso_licoes
         SET data_ultima_acesso = NOW(), tempo_gasto_minutos = $1, concluido = $2
         WHERE aluno_id = $3 AND licao_id = $4
         RETURNING *`,
        [tempo_gasto_minutos || 0, concluido || false, aluno_id, licao_id]
      );

      return NextResponse.json(result.rows[0]);
    }

    const result = await pool.query(
      `INSERT INTO progresso_licoes (aluno_id, licao_id, data_ultima_acesso, tempo_gasto_minutos, concluido)
       VALUES ($1, $2, NOW(), $3, $4)
       RETURNING *`,
      [aluno_id, licao_id, tempo_gasto_minutos || 0, concluido || false]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao atualizar progresso' }, { status: 500 });
  }
}
