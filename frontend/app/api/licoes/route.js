import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarProfessor } from '@/app/lib/auth';

export async function POST(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarProfessor(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas professores.' }, { status: 403 });
    }

    const { modulo_id, nome, descricao, video_url, ordem } = await req.json();

    if (!modulo_id || !nome || !video_url) {
      return NextResponse.json({ erro: 'Módulo, nome e vídeo são obrigatórios' }, { status: 400 });
    }

    const modulo = await pool.query(
      `SELECT m.* FROM modulos m
       INNER JOIN trilhas t ON m.trilha_id = t.id
       WHERE m.id = $1 AND t.criado_por_professor_id = $2`,
      [modulo_id, decoded.usuario_id]
    );

    if (modulo.rows.length === 0) {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    const result = await pool.query(
      'INSERT INTO licoes (modulo_id, nome, descricao, video_url, ordem, criado_em) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [modulo_id, nome, descricao || '', video_url, ordem || 1]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao criar lição' }, { status: 500 });
  }
}
