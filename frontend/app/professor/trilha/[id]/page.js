'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';

export default function GerenciarTrilhaPage() {
  const [modulos, setModulos] = useState([]);
  const [novoModuloNome, setNovoModuloNome] = useState('');
  const [novoModuloDesc, setNovoModuloDesc] = useState('');
  const [showFormModulo, setShowFormModulo] = useState(false);
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
          descricao: novoModuloDesc,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModulos([...modulos, response.data]);
      setNovoModuloNome('');
      setNovoModuloDesc('');
      setShowFormModulo(false);
    } catch (erro) {
      alert('Erro ao criar módulo');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ marginTop: '40px' }}>
          <p>Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container" style={{ marginTop: '40px' }}>
        <h1 style={{ marginBottom: '30px' }}><span className="pulse" style={{ marginRight: '12px' }}></span>Gerenciar Trilha</h1>

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
            <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Criar Novo Módulo</h2>
            <form onSubmit={handleCriarModulo}>
              <div className="form-group">
                <label htmlFor="nomeModulo">Nome do Módulo *</label>
                <input
                  id="nomeModulo"
                  type="text"
                  value={novoModuloNome}
                  onChange={(e) => setNovoModuloNome(e.target.value)}
                  placeholder="ex: Fundamentos de SEO"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descModulo">Descrição</label>
                <textarea
                  id="descModulo"
                  value={novoModuloDesc}
                  onChange={(e) => setNovoModuloDesc(e.target.value)}
                  placeholder="Descreva o módulo..."
                  rows="3"
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
            {modulos.map((modulo) => (
              <ModuloCard
                key={modulo.id}
                modulo={modulo}
                trilha_id={params.id}
                token={token}
                onRefresh={fetchModulos}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ModuloCard({ modulo, trilha_id, token, onRefresh }) {
  const [licoes, setLicoes] = useState([]);
  const [showLicoes, setShowLicoes] = useState(false);
  const [novaLicaoNome, setNovaLicaoNome] = useState('');
  const [novaLicaoVideo, setNovaLicaoVideo] = useState('');
  const [showFormLicao, setShowFormLicao] = useState(false);

  const loadLicoes = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/licoes/modulo/${modulo.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLicoes(response.data);
      setShowLicoes(true);
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
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/licoes`,
        {
          modulo_id: modulo.id,
          nome: novaLicaoNome,
          video_url: novaLicaoVideo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLicoes([...licoes, response.data]);
      setNovaLicaoNome('');
      setNovaLicaoVideo('');
      setShowFormLicao(false);
    } catch (erro) {
      alert('Erro ao criar lição');
    }
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>
        {modulo.nome}
      </h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
        {modulo.descricao}
      </p>

      <button
        onClick={loadLicoes}
        className="btn-secondary"
        style={{ marginBottom: '15px' }}
      >
        {showLicoes ? 'Ocultar Lições' : 'Ver Lições'}
      </button>

      {showLicoes && (
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '15px' }}>
            <button
              onClick={() => setShowFormLicao(!showFormLicao)}
              className="btn-primary"
            >
              {showFormLicao ? 'Cancelar' : '+ Nova Lição'}
            </button>
          </div>

          {showFormLicao && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--bg-dark)', borderRadius: '4px' }}>
              <form onSubmit={handleCriarLicao}>
                <div className="form-group">
                  <label htmlFor="nomeLicao">Nome da Lição *</label>
                  <input
                    id="nomeLicao"
                    type="text"
                    value={novaLicaoNome}
                    onChange={(e) => setNovaLicaoNome(e.target.value)}
                    placeholder="ex: O que é SEO?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="videoUrl">URL do Vídeo YouTube *</label>
                  <input
                    id="videoUrl"
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
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {licoes.map((licao) => (
                <li
                  key={licao.id}
                  style={{
                    padding: '10px',
                    backgroundColor: 'var(--bg-dark)',
                    borderRadius: '4px',
                    marginBottom: '8px',
                  }}
                >
                  📖 <strong>{licao.nome}</strong>
                  <br />
                  <small style={{ color: 'var(--text-muted)' }}>
                    {licao.video_url}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
