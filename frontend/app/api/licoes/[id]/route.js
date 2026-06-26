import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarProfessor } from '@/app/lib/auth';

export async function GET(req, { params }) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    const { id } = params;
    const result = await pool.query('SELECT * FROM licoes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ erro: 'Lição não encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao buscar lição' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarProfessor(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas professores.' }, { status: 403 });
    }

    const { id } = params;
    const { nome, descricao, video_url, ordem } = await req.json();

    const licao = await pool.query('SELECT * FROM licoes WHERE id = $1', [id]);

    if (licao.rows.length === 0) {
      return NextResponse.json({ erro: 'Lição não encontrada' }, { status: 404 });
    }

    const modulo = await pool.query(
      `SELECT m.* FROM modulos m
       INNER JOIN trilhas t ON m.trilha_id = t.id
       WHERE m.id = $1 AND t.criado_por_professor_id = $2`,
      [licao.rows[0].modulo_id, decoded.usuario_id]
    );

    if (modulo.rows.length === 0) {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    const result = await pool.query(
      'UPDATE licoes SET nome = $1, descricao = $2, video_url = $3, ordem = $4, atualizado_em = NOW() WHERE id = $5 RETURNING *',
      [
        nome || licao.rows[0].nome,
        descricao !== undefined ? descricao : licao.rows[0].descricao,
        video_url || licao.rows[0].video_url,
        ordem || licao.rows[0].ordem,
        id,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao editar lição' }, { status: 500 });
  }
}

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

    const licao = await pool.query('SELECT * FROM licoes WHERE id = $1', [id]);

    if (licao.rows.length === 0) {
      return NextResponse.json({ erro: 'Lição não encontrada' }, { status: 404 });
    }

    const modulo = await pool.query(
      `SELECT m.* FROM modulos m
       INNER JOIN trilhas t ON m.trilha_id = t.id
       WHERE m.id = $1 AND t.criado_por_professor_id = $2`,
      [licao.rows[0].modulo_id, decoded.usuario_id]
    );

    if (modulo.rows.length === 0) {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    await pool.query('DELETE FROM licoes WHERE id = $1', [id]);

    return NextResponse.json({ mensagem: 'Lição deletada com sucesso' });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao deletar lição' }, { status: 500 });
  }
}
