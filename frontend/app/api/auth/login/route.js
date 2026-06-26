import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return Response.json(
        { erro: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { erro: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return Response.json(
        { erro: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { usuario_id: usuario.id, tipo: usuario.tipo },
      process.env.JWT_SECRET || 'desenvolvimento_seguro_2026_fabio_schneider_cursos',
      { expiresIn: '1h' }
    );

    return Response.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
      },
    });
  } catch (erro) {
    console.error('Erro no login:', erro);
    return Response.json(
      { erro: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
