import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export async function GET(req) {
  try {
    const result = await pool.query("SELECT valor FROM configuracoes WHERE chave = 'banner_url'");

    if (result.rows.length === 0 || !result.rows[0].valor) {
      return NextResponse.json({ erro: 'Banner não configurado' }, { status: 404 });
    }

    const bannerUrl = result.rows[0].valor;
    const caminhoRelativo = bannerUrl.replace('/uploads/imagens/', '');
    const caminhoCompleto = join(process.cwd(), 'public', 'uploads', 'imagens', caminhoRelativo);

    console.log('Servindo banner:', caminhoCompleto);

    if (!existsSync(caminhoCompleto)) {
      console.error('Arquivo não encontrado:', caminhoCompleto);
      return NextResponse.json({ erro: 'Banner não encontrado' }, { status: 404 });
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
    console.error('Erro ao servir banner:', erro);
    return NextResponse.json({ erro: 'Erro ao servir banner' }, { status: 500 });
  }
}
