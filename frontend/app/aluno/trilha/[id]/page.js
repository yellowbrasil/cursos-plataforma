'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import axios from 'axios';
import './trilha.css';

export default function TrilhaPage() {
  const [trilha, setTrilha] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [licaoSelecionada, setLicaoSelecionada] = useState(null);
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchTrilha = async () => {
      try {
        // Buscar módulos
        const modulosRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/modulos/trilha/${params.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setModulos(modulosRes.data);
        setLoading(false);
      } catch (erro) {
        console.error('Erro:', erro);
        setLoading(false);
      }
    };

    fetchTrilha();
  }, [params.id, token]);

  const handleLicaoClique = async (licao) => {
    setLicaoSelecionada(licao);

    // Atualizar progresso
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/progresso/licao/${licao.id}`,
        { tempo_gasto_minutos: 0, concluido: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (erro) {
      console.error('Erro ao atualizar progresso:', erro);
    }

    // Buscar materiais
    try {
      const materiaisRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/materiais/licao/${licao.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMateriais(materiaisRes.data);
    } catch (erro) {
      console.error('Erro ao buscar materiais:', erro);
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
      <div className="trilha-container">
        <div className="trilha-content">
          {licaoSelecionada ? (
            <div className="licao-area">
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={() => setLicaoSelecionada(null)}
                  className="btn-secondary"
                >
                  ← Voltar
                </button>
              </div>

              <h2 style={{ marginBottom: '20px' }}>{licaoSelecionada.nome}</h2>

              <div className="video-player">
                {licaoSelecionada.video_url.includes('youtu') ? (
                  <iframe
                    width="100%"
                    height="500"
                    src={licaoSelecionada.video_url.replace('watch?v=', 'embed/')}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div style={{ background: '#1a1a1a', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p>URL de vídeo inválida</p>
                  </div>
                )}
              </div>

              <p style={{ margin: '20px 0', color: 'var(--text-muted)' }}>
                {licaoSelecionada.descricao}
              </p>

              {materiais.length > 0 && (
                <div className="materiais-section">
                  <h3>Materiais Complementares</h3>
                  <ul>
                    {materiais.map((material) => (
                      <li key={material.id}>
                        <a href={material.arquivo_url} target="_blank" rel="noopener noreferrer">
                          📎 {material.nome}
                        </a>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          ({material.tipo})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="modulos-area">
              <h2>Selecione uma Aula</h2>
              {modulos.map((modulo) => (
                <div key={modulo.id} className="modulo-box card">
                  <h3>{modulo.nome}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
                    {modulo.descricao}
                  </p>
                  <ModuloLicoes
                    modulo_id={modulo.id}
                    token={token}
                    onLicaoClique={handleLicaoClique}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {licaoSelecionada && (
          <aside className="licoes-sidebar">
            <h3>Aulas do Módulo</h3>
            <ModulosPlaylist
              modulos={modulos}
              licaoSelecionada={licaoSelecionada}
              token={token}
              onLicaoClique={handleLicaoClique}
            />
          </aside>
        )}
      </div>
    </>
  );
}

function ModuloLicoes({ modulo_id, token, onLicaoClique }) {
  const [licoes, setLicoes] = useState([]);

  useEffect(() => {
    const fetchLicoes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/licoes/modulo/${modulo_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLicoes(response.data);
      } catch (erro) {
        console.error('Erro:', erro);
      }
    };

    fetchLicoes();
  }, [modulo_id, token]);

  return (
    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
      {licoes.map((licao) => (
        <li key={licao.id} style={{ marginBottom: '8px' }}>
          <button
            onClick={() => onLicaoClique(licao)}
            className="btn-secondary"
            style={{ width: '100%', textAlign: 'left' }}
          >
            📖 {licao.nome}
          </button>
        </li>
      ))}
    </ul>
  );
}

function ModulosPlaylist({ modulos, licaoSelecionada, token, onLicaoClique }) {
  const moduloAtual = modulos.find((m) =>
    m.licoes?.some((l) => l.id === licaoSelecionada.id)
  );

  if (!moduloAtual) return null;

  return (
    <div>
      <h4 style={{ marginBottom: '15px' }}>{moduloAtual.nome}</h4>
      <ModuloLicoes
        modulo_id={moduloAtual.id}
        token={token}
        onLicaoClique={onLicaoClique}
      />
    </div>
  );
}
