import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarProfessor } from '@/app/lib/auth';

export async function GET(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    let query, params;

    if (decoded.tipo === 'professor') {
      query = 'SELECT * FROM trilhas WHERE criado_por_professor_id = $1 ORDER BY ordem ASC';
      params = [decoded.usuario_id];
    } else {
      query = `
        SELECT t.* FROM trilhas t
        INNER JOIN inscricoes i ON t.id = i.trilha_id
        WHERE i.aluno_id = $1 AND i.bloqueado = FALSE
        ORDER BY t.ordem ASC
      `;
      params = [decoded.usuario_id];
    }

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao listar trilhas' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarProfessor(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas professores.' }, { status: 403 });
    }

    const { nome, descricao, sinopse, link_asaas, ordem } = await req.json();

    if (!nome) {
      return NextResponse.json({ erro: 'Nome da trilha é obrigatório' }, { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO trilhas (nome, descricao, sinopse, ordem, link_asaas, criado_por_professor_id, criado_em) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [nome, descricao || '', sinopse || '', ordem || 1, link_asaas || '', decoded.usuario_id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao criar trilha' }, { status: 500 });
  }
}
