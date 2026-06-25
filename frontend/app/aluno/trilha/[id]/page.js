'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import axios from 'axios';
import './trilha.css';

// Extrair ID do YouTube de diferentes formatos
function getYouTubeEmbedUrl(url) {
  if (!url) return null;

  let videoId = null;

  // youtu.be/VIDEO_ID
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  }
  // youtube.com/watch?v=VIDEO_ID
  else if (url.includes('watch?v=')) {
    videoId = url.split('watch?v=')[1]?.split('&')[0];
  }
  // youtube.com/live/VIDEO_ID
  else if (url.includes('/live/')) {
    videoId = url.split('/live/')[1]?.split('?')[0];
  }
  // youtube.com/embed/VIDEO_ID
  else if (url.includes('/embed/')) {
    videoId = url.split('/embed/')[1]?.split('?')[0];
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export default function TrilhaPage() {
  const [modulos, setModulos] = useState([]);
  const [licoesMap, setLicoesMap] = useState({});
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
        const modulosRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/modulos/trilha/${params.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setModulos(modulosRes.data);

        // Buscar lições de cada módulo
        const mapaLicoes = {};
        for (const modulo of modulosRes.data) {
          const licoesRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/licoes/modulo/${modulo.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          mapaLicoes[modulo.id] = licoesRes.data;
        }
        setLicoesMap(mapaLicoes);
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
                {licaoSelecionada.video_url && getYouTubeEmbedUrl(licaoSelecionada.video_url) ? (
                  <iframe
                    width="100%"
                    height="500"
                    src={getYouTubeEmbedUrl(licaoSelecionada.video_url)}
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
                  {(licoesMap[modulo.id] || []).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Nenhuma lição neste módulo</p>
                  ) : (
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                      {(licoesMap[modulo.id] || []).map((licao) => (
                        <li key={licao.id} style={{ marginBottom: '8px' }}>
                          <button
                            onClick={() => handleLicaoClique(licao)}
                            className="btn-secondary"
                            style={{ width: '100%', textAlign: 'left' }}
                          >
                            {licao.nome}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {licaoSelecionada && (
          <aside className="licoes-sidebar">
            <h3>Aulas do Módulo</h3>
            <PlaylistLicoes
              modulos={modulos}
              licoesMap={licoesMap}
              licaoSelecionada={licaoSelecionada}
              onLicaoClique={handleLicaoClique}
            />
          </aside>
        )}
      </div>
    </>
  );
}

function PlaylistLicoes({ modulos, licoesMap, licaoSelecionada, onLicaoClique }) {
  // Encontrar módulo atual
  const moduloAtual = modulos.find((m) => {
    const licoes = licoesMap[m.id] || [];
    return licoes.some((l) => l.id === licaoSelecionada.id);
  });

  if (!moduloAtual) return null;

  const licoes = licoesMap[moduloAtual.id] || [];

  return (
    <div>
      <h4 style={{ marginBottom: '15px', color: 'var(--primary)' }}>{moduloAtual.nome}</h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {licoes.map((licao) => (
          <li key={licao.id} style={{ marginBottom: '8px' }}>
            <button
              onClick={() => onLicaoClique(licao)}
              className={licao.id === licaoSelecionada.id ? 'btn-primary' : 'btn-secondary'}
              style={{
                width: '100%',
                textAlign: 'left',
                fontSize: '13px',
                padding: '8px 12px',
                fontWeight: licao.id === licaoSelecionada.id ? '600' : '400',
              }}
            >
              {licao.nome}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
