import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool } from '@/app/lib/db';
import { verificarJWT } from '@/app/lib/auth';

export async function PUT(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    const { senha_atual, nova_senha } = await req.json();
    const usuario_id = decoded.usuario_id;

    if (!senha_atual || !nova_senha) {
      return NextResponse.json({ erro: 'Senhas são obrigatórias' }, { status: 400 });
    }

    if (nova_senha.length < 8) {
      return NextResponse.json({ erro: 'Nova senha deve ter mínimo 8 caracteres' }, { status: 400 });
    }

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [usuario_id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ erro: 'Usuário não encontrado' }, { status: 404 });
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha_atual, usuario.senha_hash);

    if (!senhaValida) {
      return NextResponse.json({ erro: 'Senha atual incorreta' }, { status: 401 });
    }

    const novaHashSenha = await bcrypt.hash(nova_senha, 10);

    await pool.query('UPDATE users SET senha_hash = $1 WHERE id = $2', [
      novaHashSenha,
      usuario_id,
    ]);

    return NextResponse.json({ mensagem: 'Senha alterada com sucesso' });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao alterar senha' }, { status: 500 });
  }
}
