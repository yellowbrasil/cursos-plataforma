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
  const [token, setToken] = useState(null);
  const [statusAcesso, setStatusAcesso] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/login');
      return;
    }
    setToken(t);

    // Extrair userId do JWT (simplificado)
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      setUserId(payload.id);
    } catch (e) {
      console.error('Erro ao decodificar JWT:', e);
    }

    const fetchTrilha = async () => {
      try {
        const modulosRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/modulos/trilha/${params.id}`,
          { headers: { Authorization: `Bearer ${t}` } }
        );

        setModulos(modulosRes.data);

        // Buscar lições de cada módulo
        const mapaLicoes = {};
        for (const modulo of modulosRes.data) {
          const licoesRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/licoes/modulo/${modulo.id}`,
            { headers: { Authorization: `Bearer ${t}` } }
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
  }, [router, params.id]);

  useEffect(() => {
    if (!token || !userId || !params.id) return;

    const fetchStatusAcesso = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/acesso/aluno/${userId}/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.data || !Array.isArray(res.data)) {
          console.warn('Resposta inválida da API de acesso:', res.data);
          return;
        }

        // Encontrar status para a trilha atual
        const trilhaIdNumero = parseInt(params.id);
        const trilhaStatus = res.data.find(s => s.trilha_id === trilhaIdNumero);

        if (trilhaStatus) {
          setStatusAcesso(trilhaStatus);
        } else {
          console.warn(`Status não encontrado para trilha ${trilhaIdNumero}`);
        }
      } catch (erro) {
        console.error('Erro ao buscar status de acesso:', erro);
      }
    };

    fetchStatusAcesso();
  }, [token, userId, params.id]);

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

  // Determinar se deve mostrar aviso crítico (≤5 dias)
  const mostrarAvisoCritico = statusAcesso &&
    (statusAcesso.status_acesso === 'expirando_em_breve' && statusAcesso.dias_faltando <= 5) ||
    statusAcesso.status_acesso === 'expirado' ||
    statusAcesso.status_acesso === 'bloqueado_manualmente';

  return (
    <>
      <Header />
      {mostrarAvisoCritico && statusAcesso && (
        <div style={{
          background: '#ff6b6b',
          color: '#fff',
          padding: '15px 20px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '14px'
        }}>
          {statusAcesso.status_acesso === 'expirado' && (
            '⚠️ Seu acesso a esta trilha expirou'
          )}
          {statusAcesso.status_acesso === 'bloqueado_manualmente' && (
            '⚠️ Seu acesso a esta trilha foi bloqueado'
          )}
          {statusAcesso.status_acesso === 'expirando_em_breve' && statusAcesso.dias_faltando <= 5 && (
            `⚠️ URGENTE: Seu acesso expira em ${statusAcesso.dias_faltando} ${statusAcesso.dias_faltando === 1 ? 'dia' : 'dias'}`
          )}
        </div>
      )}
      <div className="trilha-container">
        {!licaoSelecionada && statusAcesso && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: statusAcesso.status_acesso === 'expirando_em_breve' && statusAcesso.dias_faltando <= 15
              ? '#fff3cd'
              : 'var(--bg-card)',
            border: statusAcesso.status_acesso === 'expirando_em_breve' && statusAcesso.dias_faltando <= 15
              ? '2px solid #ff922b'
              : '1px solid var(--border)',
            borderRadius: '8px',
            padding: '15px 20px',
            maxWidth: '250px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              ⏰ Seu Acesso
            </div>
            {statusAcesso.status_acesso === 'ativo' && (
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#51cf66' }}>
                ✓ {statusAcesso.dias_faltando} {statusAcesso.dias_faltando === 1 ? 'dia' : 'dias'}
              </div>
            )}
            {statusAcesso.status_acesso === 'expirando_em_breve' && statusAcesso.dias_faltando > 5 && (
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#ff922b' }}>
                ⚠️ {statusAcesso.dias_faltando} {statusAcesso.dias_faltando === 1 ? 'dia' : 'dias'}
              </div>
            )}
            {statusAcesso.status_acesso === 'expirando_em_breve' && statusAcesso.dias_faltando <= 5 && (
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#ff6b6b' }}>
                🚨 {statusAcesso.dias_faltando} RESTANTE(S)
              </div>
            )}
            {statusAcesso.status_acesso === 'expirado' && (
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#ff6b6b' }}>
                ✗ Acesso Expirado
              </div>
            )}
            {statusAcesso.status_acesso === 'bloqueado_manualmente' && (
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#ff6b6b' }}>
                🔒 Acesso Bloqueado
              </div>
            )}
          </div>
        )}
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
            {statusAcesso && (
              <div style={{
                background: statusAcesso.status_acesso === 'expirando_em_breve' && statusAcesso.dias_faltando <= 15
                  ? '#fff3cd'
                  : 'var(--bg-secondary)',
                border: statusAcesso.status_acesso === 'expirando_em_breve' && statusAcesso.dias_faltando <= 15
                  ? '2px solid #ff922b'
                  : '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  ⏰ Seu Acesso
                </div>

                {statusAcesso.status_acesso === 'ativo' && (
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#51cf66' }}>
                    ✓ {statusAcesso.dias_faltando} {statusAcesso.dias_faltando === 1 ? 'dia' : 'dias'} restantes
                  </div>
                )}

                {statusAcesso.status_acesso === 'expirando_em_breve' && statusAcesso.dias_faltando > 5 && (
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ff922b' }}>
                    ⚠️ {statusAcesso.dias_faltando} {statusAcesso.dias_faltando === 1 ? 'dia' : 'dias'} restantes
                  </div>
                )}

                {statusAcesso.status_acesso === 'expirando_em_breve' && statusAcesso.dias_faltando <= 5 && (
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ff6b6b' }}>
                    🚨 {statusAcesso.dias_faltando} {statusAcesso.dias_faltando === 1 ? 'dia' : 'dias'} RESTANTE(S)
                  </div>
                )}

                {statusAcesso.status_acesso === 'expirado' && (
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ff6b6b' }}>
                    ✗ Acesso Expirado
                  </div>
                )}

                {statusAcesso.status_acesso === 'bloqueado_manualmente' && (
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ff6b6b' }}>
                    🔒 Acesso Bloqueado
                  </div>
                )}
              </div>
            )}
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
