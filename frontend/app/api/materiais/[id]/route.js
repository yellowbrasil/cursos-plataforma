import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarProfessor } from '@/app/lib/auth';

export async function DELETE(req, { params }) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarProfessor(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas professores.' }, { status: 403 });
    }

    const { id } = params;

    const material = await pool.query('SELECT * FROM materiais WHERE id = $1', [id]);

    if (material.rows.length === 0) {
      return NextResponse.json({ erro: 'Material não encontrado' }, { status: 404 });
    }

    const licao = await pool.query(
      `SELECT l.* FROM licoes l
       INNER JOIN modulos m ON l.modulo_id = m.id
       INNER JOIN trilhas t ON m.trilha_id = t.id
       WHERE l.id = $1 AND t.criado_por_professor_id = $2`,
      [material.rows[0].licao_id, decoded.usuario_id]
    );

    if (licao.rows.length === 0) {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    await pool.query('DELETE FROM materiais WHERE id = $1', [id]);

    return NextResponse.json({ mensagem: 'Material deletado com sucesso' });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao deletar material' }, { status: 500 });
  }
}
