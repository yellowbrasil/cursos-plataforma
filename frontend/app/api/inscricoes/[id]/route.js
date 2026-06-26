import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT } from '@/app/lib/auth';

export async function DELETE(req, { params }) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    const { id } = params;

    const inscricao = await pool.query('SELECT * FROM inscricoes WHERE id = $1', [id]);

    if (inscricao.rows.length === 0) {
      return NextResponse.json({ erro: 'Inscrição não encontrada' }, { status: 404 });
    }

    if (decoded.usuario_id !== inscricao.rows[0].aluno_id && decoded.tipo !== 'admin') {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    await pool.query('DELETE FROM inscricoes WHERE id = $1', [id]);

    return NextResponse.json({ mensagem: 'Desinscrição realizada com sucesso' });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao deletar inscrição' }, { status: 500 });
  }
}
