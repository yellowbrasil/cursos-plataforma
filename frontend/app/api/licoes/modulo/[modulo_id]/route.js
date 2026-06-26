import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT } from '@/app/lib/auth';

export async function GET(req, { params }) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    const { modulo_id } = params;

    const result = await pool.query(
      'SELECT * FROM licoes WHERE modulo_id = $1 ORDER BY ordem ASC',
      [modulo_id]
    );

    return NextResponse.json(result.rows);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao listar lições' }, { status: 500 });
  }
}
