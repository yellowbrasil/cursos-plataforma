import express from 'express';
import { pool } from '../server.js';
import { verificarJWT, verificarProfessor } from '../middleware/auth.js';
import { uploadImagem } from '../middleware/uploadImagem.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Get configurações (público - qualquer um pode ver)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT chave, valor FROM configuracoes');
    const config = {};
    result.rows.forEach((row) => {
      config[row.chave] = row.valor;
    });
    res.json(config);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar configurações' });
  }
});

// Get banner como arquivo (evita problemas de CORS com arquivo estático)
router.get('/banner/download', async (req, res) => {
  try {
    const result = await pool.query("SELECT valor FROM configuracoes WHERE chave = 'banner_url'");

    if (result.rows.length === 0 || !result.rows[0].valor) {
      return res.status(404).json({ erro: 'Banner não configurado' });
    }

    const bannerUrl = result.rows[0].valor;
    const caminhoRelativo = bannerUrl.replace('/uploads/', '');
    const caminhoCompleto = path.resolve('./uploads', caminhoRelativo);

    // Verificar se arquivo existe
    if (!fs.existsSync(caminhoCompleto)) {
      return res.status(404).json({ erro: 'Banner não encontrado' });
    }

    // Enviar arquivo com headers corretos
    res.sendFile(caminhoCompleto);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao servir banner' });
  }
});

// Update configurações (apenas professor/admin)
router.put('/', verificarJWT, verificarProfessor, uploadImagem.single('banner'), async (req, res) => {
  try {
    const { link_asaas, aviso_alunos } = req.body;

    // Atualizar link do Asaas
    if (link_asaas !== undefined) {
      await pool.query(
        'UPDATE configuracoes SET valor = $1 WHERE chave = $2',
        [link_asaas, 'link_asaas']
      );
    }

    // Atualizar aviso para alunos
    if (aviso_alunos !== undefined) {
      await pool.query(
        'UPDATE configuracoes SET valor = $1 WHERE chave = $2',
        [aviso_alunos, 'aviso_alunos']
      );
    }

    // Atualizar banner se arquivo foi enviado
    if (req.file) {
      // PROTEÇÃO: Nunca deletar dados - apenas guardar novo banner
      // Arquivo antigo é preservado no disco por segurança
      const banner_url = `/uploads/imagens/${req.file.filename}`;
      await pool.query(
        'UPDATE configuracoes SET valor = $1 WHERE chave = $2',
        [banner_url, 'banner_url']
      );
      console.log('Banner atualizado (preservando arquivo antigo):', banner_url);
    }

    // Retornar configurações atualizadas
    const result = await pool.query('SELECT chave, valor FROM configuracoes');
    const config = {};
    result.rows.forEach((row) => {
      config[row.chave] = row.valor;
    });

    res.json(config);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao atualizar configurações' });
  }
});

export default router;
