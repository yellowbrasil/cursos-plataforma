import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const trilha = await pool.query('SELECT imagem_url FROM trilhas WHERE id = $1', [id]);

    if (trilha.rows.length === 0 || !trilha.rows[0].imagem_url) {
      return NextResponse.json({ erro: 'Imagem não encontrada' }, { status: 404 });
    }

    const imagemUrl = trilha.rows[0].imagem_url;
    const caminhoRelativo = imagemUrl.replace('/uploads/imagens/', '');
    const caminhoCompleto = join(process.cwd(), 'public', 'uploads', 'imagens', caminhoRelativo);

    if (!existsSync(caminhoCompleto)) {
      return NextResponse.json({ erro: 'Arquivo não encontrado' }, { status: 404 });
    }

    const fileBuffer = await readFile(caminhoCompleto);
    const fileExt = caminhoCompleto.split('.').pop().toLowerCase();

    let contentType = 'application/octet-stream';
    if (fileExt === 'png') contentType = 'image/png';
    else if (fileExt === 'jpg' || fileExt === 'jpeg') contentType = 'image/jpeg';
    else if (fileExt === 'gif') contentType = 'image/gif';
    else if (fileExt === 'webp') contentType = 'image/webp';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length,
      },
    });
  } catch (erro) {
    console.error('Erro ao servir imagem da trilha:', erro);
    return NextResponse.json({ erro: 'Erro ao servir imagem' }, { status: 500 });
  }
}
