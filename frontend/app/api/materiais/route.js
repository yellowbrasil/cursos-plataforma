import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarProfessor } from '@/app/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarProfessor(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas professores.' }, { status: 403 });
    }

    const formData = await req.formData();
    const licao_id = formData.get('licao_id');
    const nome = formData.get('nome');
    const arquivo = formData.get('arquivo');

    if (!licao_id || !nome || !arquivo) {
      return NextResponse.json({ erro: 'Lição, nome e arquivo são obrigatórios' }, { status: 400 });
    }

    const licao = await pool.query(
      `SELECT l.* FROM licoes l
       INNER JOIN modulos m ON l.modulo_id = m.id
       INNER JOIN trilhas t ON m.trilha_id = t.id
       WHERE l.id = $1 AND t.criado_por_professor_id = $2`,
      [licao_id, decoded.usuario_id]
    );

    if (licao.rows.length === 0) {
      return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
    }

    const bytes = await arquivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${arquivo.name}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    const arquivo_url = `/uploads/${filename}`;
    const tipo = arquivo.type.includes('sheet') || arquivo.type.includes('excel') ? 'planilha' :
                  arquivo.type.includes('pdf') ? 'pdf' :
                  arquivo.type.includes('word') ? 'docs' : 'outro';
    const tamanho = buffer.length;

    const result = await pool.query(
      'INSERT INTO materiais (licao_id, nome, arquivo_url, tipo, tamanho, criado_em) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [licao_id, nome, arquivo_url, tipo || 'pdf', tamanho || 0]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao adicionar material' }, { status: 500 });
  }
}
