import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT } from '@/app/lib/auth';

export async function GET(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    const result = await pool.query(
      'SELECT id, email, nome, tipo FROM users WHERE id = $1',
      [decoded.usuario_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ erro: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao buscar perfil' }, { status: 500 });
  }
}
