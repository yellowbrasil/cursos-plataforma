'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './styles.css';

export default function GerenciarTrilhaPage() {
  const [modulos, setModulos] = useState([]);
  const [licoesMap, setLicoesMap] = useState({});
  const [novoModuloNome, setNovoModuloNome] = useState('');
  const [showFormModulo, setShowFormModulo] = useState(false);
  const [expandedModulo, setExpandedModulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchModulos();
  }, [token]);

  const fetchModulos = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/modulos/trilha/${params.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModulos(response.data);

      // Buscar lições de cada módulo
      const mapaLicoes = {};
      for (const modulo of response.data) {
        const licoesRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/licoes/modulo/${modulo.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        mapaLicoes[modulo.id] = licoesRes.data;
      }
      setLicoesMap(mapaLicoes);
    } catch (erro) {
      console.error('Erro:', erro);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarModulo = async (e) => {
    e.preventDefault();

    if (!novoModuloNome) {
      alert('Nome do módulo é obrigatório');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/modulos`,
        {
          trilha_id: parseInt(params.id),
          nome: novoModuloNome,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModulos([...modulos, response.data]);
      setLicoesMap({ ...licoesMap, [response.data.id]: [] });
      setNovoModuloNome('');
      setShowFormModulo(false);
    } catch (erro) {
      alert('Erro ao criar módulo');
    }
  };

  const handleReordenarModulo = async (moduloId, direcao) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reordenar/modulo/${moduloId}/${direcao}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModulos(response.data);
    } catch (erro) {
      alert(erro.response?.data?.erro || 'Erro ao reordenar');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ marginTop: '40px' }}>
          <p>Carregando...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
        <h1 style={{ marginBottom: '30px' }}>
          <span className="pulse" style={{ marginRight: '12px' }}></span>Gerenciar Trilha
        </h1>

        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => setShowFormModulo(!showFormModulo)}
            className="btn-primary"
          >
            {showFormModulo ? 'Cancelar' : '+ Novo Módulo'}
          </button>
        </div>

        {showFormModulo && (
          <div className="card" style={{ marginBottom: '30px', borderLeft: '4px solid var(--primary)' }}>
            <form onSubmit={handleCriarModulo}>
              <div className="form-group">
                <label>Nome do Módulo</label>
                <input
                  type="text"
                  value={novoModuloNome}
                  onChange={(e) => setNovoModuloNome(e.target.value)}
                  placeholder="ex: Fundamentos de SEO"
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                Criar Módulo
              </button>
            </form>
          </div>
        )}

        {modulos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nenhum módulo criado ainda.</p>
        ) : (
          <div>
            {modulos.map((modulo, index) => (
              <ModuloCard
                key={modulo.id}
                modulo={modulo}
                index={index}
                totalModulos={modulos.length}
                licoes={licoesMap[modulo.id] || []}
                token={token}
                onRefresh={fetchModulos}
                onReordenar={handleReordenarModulo}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

function ModuloCard({ modulo, index, totalModulos, licoes, token, onRefresh, onReordenar }) {
  const [novaLicaoNome, setNovaLicaoNome] = useState('');
  const [novaLicaoVideo, setNovaLicaoVideo] = useState('');
  const [showFormLicao, setShowFormLicao] = useState(false);
  const [showMateriais, setShowMateriais] = useState(null);
  const [materiais, setMateriais] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    if (showMateriais !== null) {
      fetchMateriais(showMateriais);
    }
  }, [showMateriais]);

  const fetchMateriais = async (licaoId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/materiais/licao/${licaoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMateriais(response.data);
    } catch (erro) {
      console.error('Erro:', erro);
    }
  };

  const handleCriarLicao = async (e) => {
    e.preventDefault();

    if (!novaLicaoNome || !novaLicaoVideo) {
      alert('Nome e vídeo são obrigatórios');
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/licoes`,
        {
          modulo_id: modulo.id,
          nome: novaLicaoNome,
          video_url: novaLicaoVideo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNovaLicaoNome('');
      setNovaLicaoVideo('');
      setShowFormLicao(false);
      onRefresh();
    } catch (erro) {
      alert('Erro ao criar lição');
    }
  };

  const handleUploadArquivo = async (licaoId, e) => {
    e.preventDefault();

    if (!uploadFile) {
      alert('Selecione um arquivo');
      return;
    }

    const formData = new FormData();
    formData.append('arquivo', uploadFile);
    formData.append('licao_id', licaoId);
    formData.append('nome', uploadFile.name);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/materiais`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUploadFile(null);
      fetchMateriais(licaoId);
    } catch (erro) {
      alert(erro.response?.data?.erro || 'Erro ao fazer upload');
    }
  };

  const handleReordenarLicao = async (licaoId, direcao) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reordenar/licao/${licaoId}/${direcao}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRefresh();
    } catch (erro) {
      alert(erro.response?.data?.erro || 'Erro ao reordenar');
    }
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '5px' }}>{modulo.nome}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{licoes.length} aula(s)</p>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onReordenar(modulo.id, 'cima')}
            disabled={index === 0}
            className="btn-sm"
          >
            Cima
          </button>
          <button
            onClick={() => onReordenar(modulo.id, 'baixo')}
            disabled={index === totalModulos - 1}
            className="btn-sm"
          >
            Baixo
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={() => setShowFormLicao(!showFormLicao)}
          className="btn-primary"
          style={{ fontSize: '13px', padding: '8px 16px' }}
        >
          {showFormLicao ? 'Cancelar' : '+ Nova Lição'}
        </button>
      </div>

      {showFormLicao && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--bg-dark)', borderRadius: '4px' }}>
          <form onSubmit={handleCriarLicao}>
            <div className="form-group">
              <label>Nome da Lição</label>
              <input
                type="text"
                value={novaLicaoNome}
                onChange={(e) => setNovaLicaoNome(e.target.value)}
                placeholder="ex: O que é SEO?"
              />
            </div>

            <div className="form-group">
              <label>URL do Vídeo YouTube</label>
              <input
                type="text"
                value={novaLicaoVideo}
                onChange={(e) => setNovaLicaoVideo(e.target.value)}
                placeholder="https://youtu.be/abc123"
              />
            </div>

            <button type="submit" className="btn-primary">
              Criar Lição
            </button>
          </form>
        </div>
      )}

      {licoes.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Nenhuma lição criada.</p>
      ) : (
        <div>
          {licoes.map((licao, licaoIndex) => (
            <div key={licao.id} style={{ marginBottom: '15px' }}>
              <div className="licao-item">
                <div className="licao-info">
                  <strong>{licao.nome}</strong>
                </div>
                <div className="licao-buttons">
                  <button
                    onClick={() => handleReordenarLicao(licao.id, 'cima')}
                    disabled={licaoIndex === 0}
                    className="btn-sm"
                  >
                    Cima
                  </button>
                  <button
                    onClick={() => handleReordenarLicao(licao.id, 'baixo')}
                    disabled={licaoIndex === licoes.length - 1}
                    className="btn-sm"
                  >
                    Baixo
                  </button>
                  <button
                    onClick={() => setShowMateriais(showMateriais === licao.id ? null : licao.id)}
                    className="btn-sm"
                  >
                    Arquivos
                  </button>
                </div>
              </div>

              {showMateriais === licao.id && (
                <div style={{ paddingLeft: '12px', marginTop: '8px' }}>
                  <form onSubmit={(e) => handleUploadArquivo(licao.id, e)}>
                    <div className="upload-area">
                      <input
                        type="file"
                        id={`file-${licao.id}`}
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        accept=".pdf,.xlsx,.xls,.doc,.docx,.txt"
                      />
                      <label htmlFor={`file-${licao.id}`} style={{ cursor: 'pointer', display: 'block' }}>
                        <p>Clique para selecionar arquivo ou arraste aqui</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {uploadFile ? uploadFile.name : 'PDF, Planilhas, Documentos (máx 50MB)'}
                        </p>
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ marginTop: '8px', width: '100%', fontSize: '13px', padding: '8px' }}
                    >
                      Upload
                    </button>
                  </form>

                  {materiais.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Arquivos:</p>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {materiais.map((material) => (
                          <li
                            key={material.id}
                            style={{
                              fontSize: '12px',
                              padding: '6px 8px',
                              backgroundColor: 'var(--bg-dark)',
                              borderRadius: '4px',
                              marginBottom: '4px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <a href={material.arquivo_url} target="_blank" rel="noopener noreferrer">
                              {material.nome}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
