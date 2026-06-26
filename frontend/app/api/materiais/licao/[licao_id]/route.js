import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT } from '@/app/lib/auth';

export async function GET(req, { params }) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    const { licao_id } = params;

    const result = await pool.query(
      'SELECT * FROM materiais WHERE licao_id = $1 ORDER BY criado_em ASC',
      [licao_id]
    );

    return NextResponse.json(result.rows);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao listar materiais' }, { status: 500 });
  }
}
