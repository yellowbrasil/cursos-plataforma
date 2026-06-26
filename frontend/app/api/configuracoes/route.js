import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import { verificarJWT, verificarProfessor } from '@/app/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export async function GET(req) {
  try {
    const result = await pool.query('SELECT chave, valor FROM configuracoes');
    const config = {};
    result.rows.forEach((row) => {
      config[row.chave] = row.valor;
    });
    return NextResponse.json(config);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const decoded = verificarJWT(req);
    if (!decoded) {
      return NextResponse.json({ erro: 'Token não fornecido' }, { status: 401 });
    }

    if (!verificarProfessor(decoded)) {
      return NextResponse.json({ erro: 'Acesso negado. Apenas professores.' }, { status: 403 });
    }

    const formData = await req.formData();
    const link_asaas = formData.get('link_asaas');
    const aviso_alunos = formData.get('aviso_alunos');
    const banner = formData.get('banner');

    if (link_asaas !== null) {
      await pool.query(
        'UPDATE configuracoes SET valor = $1, atualizado_em = NOW() WHERE chave = $2',
        [link_asaas, 'link_asaas']
      );
    }

    if (aviso_alunos !== null) {
      await pool.query(
        'UPDATE configuracoes SET valor = $1, atualizado_em = NOW() WHERE chave = $2',
        [aviso_alunos, 'aviso_alunos']
      );
    }

    if (banner) {
      const bannerAntigo = await pool.query(
        "SELECT valor FROM configuracoes WHERE chave = 'banner_url'"
      );

      if (bannerAntigo.rows.length > 0 && bannerAntigo.rows[0].valor) {
        const caminhoAntigo = join(process.cwd(), 'public', bannerAntigo.rows[0].valor.replace('/uploads/imagens/', ''));
        try {
          if (existsSync(caminhoAntigo)) {
            await unlink(caminhoAntigo);
            console.log('Banner antigo deletado:', caminhoAntigo);
          }
        } catch (erroDelete) {
          console.error('Erro ao deletar banner antigo:', erroDelete);
        }
      }

      const bytes = await banner.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${banner.name}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'imagens');

      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, filename), buffer);

      const banner_url = `/uploads/imagens/${filename}`;
      await pool.query(
        'UPDATE configuracoes SET valor = $1, atualizado_em = NOW() WHERE chave = $2',
        [banner_url, 'banner_url']
      );
    }

    const result = await pool.query('SELECT chave, valor FROM configuracoes');
    const config = {};
    result.rows.forEach((row) => {
      config[row.chave] = row.valor;
    });

    return NextResponse.json(config);
  } catch (erro) {
    console.error(erro);
    return NextResponse.json({ erro: 'Erro ao atualizar configurações' }, { status: 500 });
  }
}
