'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AlunoDashboardPage() {
  const [todasTrilhas, setTodasTrilhas] = useState([]);
  const [progresso, setProgresso] = useState({});
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('minhas');
  const [statusAcesso, setStatusAcesso] = useState({});
  const [modalAvisoBloqueado, setModalAvisoBloqueado] = useState(false);
  const [trilhaComAviso, setTrilhaComAviso] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/login');
      return;
    }

    let userId = null;
    const u = JSON.parse(localStorage.getItem('usuario') || '{}');
    userId = u.id;

    if (!userId && t) {
      try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        userId = payload.id;
      } catch (e) {
        console.error('Erro ao decodificar JWT:', e);
      }
    }

    if (!userId) return;

    setToken(t);
    fetchData(t, userId);
  }, [router]);

  const fetchData = async (t, userId) => {
    try {
      await fetchTrilhas(t);
      await fetchConfiguracoes(t);
      await fetchStatusAcesso(t, userId);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrilhas = async (t) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trilhas/com-status/todas`,
        { headers: { Authorization: `Bearer ${t}` } }
      );
      setTodasTrilhas(response.data || []);

      // Buscar progresso apenas de trilhas compradas
      const progressoMap = {};
      for (const trilha of response.data) {
        if (trilha.status_inscricao === 'inscrito') {
          try {
            const progRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/alunos/progresso/${trilha.id}`,
              { headers: { Authorization: `Bearer ${t}` } }
            );
            progressoMap[trilha.id] = progRes.data;
          } catch (erro) {
            progressoMap[trilha.id] = { total: 0, completadas: 0, faltam: 0, percentual: 0 };
          }
        }
      }
      setProgresso(progressoMap);
    } catch (erro) {
      console.error('Erro ao buscar trilhas:', erro);
    }
  };

  const fetchConfiguracoes = async (t) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracoes`,
        { headers: { Authorization: `Bearer ${t}` } }
      );
      setConfig(response.data);
    } catch (erro) {
      console.error('Erro:', erro);
    }
  };

  const fetchStatusAcesso = async (t, userId) => {
    if (!t || !userId) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/acesso/aluno/${userId}/status`,
        { headers: { Authorization: `Bearer ${t}` } }
      );

      if (!response.data || !Array.isArray(response.data)) return;

      const statusMap = {};
      response.data.forEach(item => {
        statusMap[item.trilha_id] = item;
      });

      setStatusAcesso(statusMap);
    } catch (erro) {
      console.error('Erro ao buscar status de acesso:', erro.message);
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

  const minhasTrilhas = todasTrilhas.filter(t => t.status_inscricao === 'inscrito');
  const novasTrilhas = todasTrilhas.filter(t => t.status_inscricao === 'nao_inscrito');

  const trilhasParaMostrar =
    abaAtiva === 'minhas' ? minhasTrilhas :
    abaAtiva === 'novo' ? novasTrilhas :
    todasTrilhas;

  const handleRenovar = async () => {
    if (!trilhaComAviso || !token) return;

    try {
      const statusTrilha = statusAcesso[trilhaComAviso.id];
      const inscricaoId = statusTrilha?.id;

      if (!inscricaoId) {
        alert('Erro: não conseguimos identificar sua inscrição');
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/acesso/${inscricaoId}/renovar`,
        { dias_adicionais: 30 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchStatusAcesso(token, JSON.parse(localStorage.getItem('usuario') || '{}').id);
      setModalAvisoBloqueado(false);
      alert('Acesso renovado com sucesso! Adicionados 30 dias.');
    } catch (erro) {
      alert('Erro ao renovar acesso: ' + (erro.response?.data?.erro || erro.message));
    }
  };

  return (
    <>
      <Header />

      {config.banner_url && (
        <div style={{
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginTop: '20px',
          marginBottom: '40px',
        }}>
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/api/configuracoes/banner/download`}
            alt="Banner"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
            loading="eager"
          />
        </div>
      )}

      <div className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
        {config.aviso_alunos && (
          <div style={{
            backgroundColor: 'var(--primary)',
            color: '#000',
            padding: '16px',
            borderRadius: '4px',
            marginBottom: '30px',
            fontWeight: '600',
            fontSize: '14px',
          }}>
            ● {config.aviso_alunos}
          </div>
        )}

        <h1 style={{ marginBottom: '30px' }}>
          <span className="pulse" style={{ marginRight: '12px' }}></span>
          Biblioteca de Cursos
        </h1>

        {/* ABAS */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '40px',
          borderBottom: '2px solid var(--border)',
          paddingBottom: '0'
        }}>
          <button
            onClick={() => setAbaAtiva('minhas')}
            style={{
              padding: '12px 20px',
              backgroundColor: abaAtiva === 'minhas' ? 'var(--primary)' : 'transparent',
              color: abaAtiva === 'minhas' ? '#000' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderBottom: abaAtiva === 'minhas' ? 'none' : '2px solid transparent',
              transition: 'all 0.3s'
            }}
          >
            ● Meus Cursos ({minhasTrilhas.length})
          </button>

          <button
            onClick={() => setAbaAtiva('novo')}
            style={{
              padding: '12px 20px',
              backgroundColor: abaAtiva === 'novo' ? 'var(--primary)' : 'transparent',
              color: abaAtiva === 'novo' ? '#000' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderBottom: abaAtiva === 'novo' ? 'none' : '2px solid transparent',
              transition: 'all 0.3s'
            }}
          >
            ● Novidades ({novasTrilhas.length})
          </button>

          <button
            onClick={() => setAbaAtiva('todos')}
            style={{
              padding: '12px 20px',
              backgroundColor: abaAtiva === 'todos' ? 'var(--primary)' : 'transparent',
              color: abaAtiva === 'todos' ? '#000' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderBottom: abaAtiva === 'todos' ? 'none' : '2px solid transparent',
              transition: 'all 0.3s'
            }}
          >
            ● Explorar Tudo ({todasTrilhas.length})
          </button>
        </div>

        {/* GRID DE TRILHAS */}
        {trilhasParaMostrar.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '20px' }}>
              {abaAtiva === 'minhas' && 'Você ainda não tem nenhum curso.'}
              {abaAtiva === 'novo' && 'Nenhum curso novo no momento.'}
              {abaAtiva === 'todos' && 'Nenhum curso disponível.'}
            </p>
            {abaAtiva === 'minhas' && (
              <button
                onClick={() => setAbaAtiva('novo')}
                style={{
                  padding: '12px 30px',
                  backgroundColor: 'var(--primary)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Explorar Cursos Disponíveis →
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {trilhasParaMostrar.map((trilha) => {
              const prog = progresso[trilha.id] || { total: 0, completadas: 0, faltam: 0, percentual: 0 };
              const isComprada = trilha.status_inscricao === 'inscrito';
              const isNova = novasTrilhas.some(t => t.id === trilha.id);

              return (
                <div
                  key={trilha.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: isComprada ? 'pointer' : 'default',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => {
                    if (!isComprada) return;

                    const status = statusAcesso[trilha.id];

                    if (status?.status === 'expirado' || status?.status === 'bloqueado_manualmente') {
                      return;
                    }

                    if (status?.status === 'expirando_em_breve') {
                      setTrilhaComAviso({
                        id: trilha.id,
                        nome: trilha.nome,
                        aviso: status.aviso,
                        dias_faltando: status.dias_faltando
                      });
                      setModalAvisoBloqueado(true);
                      return;
                    }

                    router.push(`/aluno/trilha/${trilha.id}`);
                  }}
                  onMouseEnter={(e) => isComprada && (e.currentTarget.style.transform = 'translateY(-8px)', e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)')}
                  onMouseLeave={(e) => isComprada && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
                >
                  {/* TARJAS */}
                  {/* Contador de dias - SEMPRE visível para trilhas compradas */}
                  {isComprada && statusAcesso && statusAcesso[trilha.id] && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor:
                        statusAcesso[trilha.id]?.status_acesso === 'ativo' ? '#51cf66' :
                        statusAcesso[trilha.id]?.status_acesso === 'expirando_em_breve' && statusAcesso[trilha.id]?.dias_faltando > 5 ? '#ff922b' :
                        '#ff6b6b',
                      color: statusAcesso[trilha.id]?.status_acesso === 'ativo' ? '#000' : '#fff',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      zIndex: 10
                    }}>
                      {statusAcesso[trilha.id]?.status_acesso === 'ativo' && (
                        `● ${statusAcesso[trilha.id]?.dias_faltando} DIAS`
                      )}
                      {statusAcesso[trilha.id]?.status_acesso === 'expirando_em_breve' && statusAcesso[trilha.id]?.dias_faltando > 5 && (
                        `● ${statusAcesso[trilha.id]?.dias_faltando} DIAS`
                      )}
                      {statusAcesso[trilha.id]?.status_acesso === 'expirando_em_breve' && statusAcesso[trilha.id]?.dias_faltando <= 5 && (
                        `🚨 ${statusAcesso[trilha.id]?.dias_faltando} DIAS`
                      )}
                      {statusAcesso[trilha.id]?.status_acesso === 'expirado' && (
                        `● EXPIRADO`
                      )}
                      {statusAcesso[trilha.id]?.status_acesso === 'bloqueado_manualmente' && (
                        `● BLOQUEADO`
                      )}
                    </div>
                  )}

                  {isComprada && prog.percentual === 100 && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#51cf66',
                      color: '#000',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      zIndex: 10
                    }}>
                      ● CONCLUÍDO
                    </div>
                  )}

                  {isNova && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: '#ff922b',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      zIndex: 10
                    }}>
                      ● NOVO
                    </div>
                  )}

                  {/* IMAGEM */}
                  {trilha.imagem_url && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/api/trilhas/${trilha.id}/imagem`}
                      alt={trilha.nome}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                      }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}

                  {/* CONTEÚDO */}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '10px', color: 'var(--primary)', fontSize: '16px' }}>
                      {trilha.nome}
                    </h3>

                    {trilha.sinopse && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '15px', lineHeight: '1.4' }}>
                        {trilha.sinopse}
                      </p>
                    )}

                    {/* PROGRESSO - só para cursos comprados */}
                    {isComprada && (
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px', color: 'var(--text-muted)' }}>
                          <span>Progresso</span>
                          <span>{prog.completadas}/{prog.total} lições</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: 'var(--bg-dark)',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${prog.percentual}%`,
                            backgroundColor: prog.percentual === 100 ? '#51cf66' : 'var(--primary)',
                            transition: 'width 0.3s'
                          }} />
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
                          {prog.percentual}%
                        </div>
                      </div>
                    )}

                    {/* BOTÃO */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isComprada) {
                          router.push(`/aluno/trilha/${trilha.id}`);
                        } else if (trilha.link_asaas) {
                          window.open(trilha.link_asaas, '_blank');
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: isComprada ? (prog.percentual === 100 ? '#51cf66' : 'var(--primary)') : '#4c6ef5',
                        color: '#000',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '13px',
                        transition: 'background-color 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isComprada) e.target.style.backgroundColor = '#364fc7';
                      }}
                      onMouseLeave={(e) => {
                        if (!isComprada) e.target.style.backgroundColor = '#4c6ef5';
                      }}
                    >
                      {isComprada ? (prog.percentual === 100 ? '● Concluído' : '● Continuar') : '● Adquirir'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE AVISO DE EXPIRAÇÃO */}
      {modalAvisoBloqueado && trilhaComAviso && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            border: '2px solid #ff6b6b',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          }}>
            <h2 style={{ color: '#ff6b6b', marginTop: 0, marginBottom: '15px', fontSize: '20px' }}>
              ⚠️ Seu acesso está expirando!
            </h2>

            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
              <strong>{trilhaComAviso.nome}</strong>
            </p>

            <p style={{ color: 'var(--text)', marginBottom: '25px', fontSize: '14px', lineHeight: '1.6' }}>
              Faltam apenas <strong>{trilhaComAviso.dias_faltando} dias</strong> para você perder acesso a esta trilha.
            </p>

            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '13px' }}>
              {trilhaComAviso.aviso}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleRenovar}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'var(--primary)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ● Renovar Acesso
              </button>

              <button
                onClick={() => {
                  setModalAvisoBloqueado(false);
                  router.push(`/aluno/trilha/${trilhaComAviso.id}`);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: 'var(--primary)',
                  border: '2px solid var(--primary)',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ● Depois
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
