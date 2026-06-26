import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/app/lib/db';
import { sign } from '@/app/lib/auth';

export async function POST(req) {
  try {
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json({ erro: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return NextResponse.json({ erro: 'Email ou senha incorretos' }, { status: 401 });
    }

    const usuario = result.rows[0];

    if (!usuario.ativo) {
      return NextResponse.json({ erro: 'Usuário desativado' }, { status: 403 });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return NextResponse.json({ erro: 'Email ou senha incorretos' }, { status: 401 });
    }

    const token = sign({ usuario_id: usuario.id, tipo: usuario.tipo });

    return NextResponse.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
      },
    });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao fazer login' }, { status: 500 });
  }
}
