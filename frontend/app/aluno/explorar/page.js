'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ExplorarPage() {
  const [trilhas, setTrilhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/login');
      return;
    }
    setToken(t);
    fetchTrilhas(t);
  }, [router]);

  const fetchTrilhas = async (t) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trilhas/com-status/todas`,
        { headers: { Authorization: `Bearer ${t}` } }
      );
      // Filtrar apenas trilhas não inscritas
      setTrilhas(response.data.filter(t => t.status_inscricao === 'nao_inscrito'));
    } catch (erro) {
      console.error('Erro:', erro);
    } finally {
      setLoading(false);
    }
  };

  const handleComprar = (trilha) => {
    if (trilha.link_asaas) {
      window.open(trilha.link_asaas, '_blank');
    } else {
      alert('Trilha sem link de compra configurado. Contacte um professor!');
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
      <div className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
        <h1><span className="pulse" style={{ marginRight: '12px' }}></span>Explorar Trilhas</h1>

        {trilhas.length === 0 ? (
          <p style={{ marginTop: '20px', color: '#ccc' }}>
            Você já está inscrito em todas as trilhas disponíveis! 🎉
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            marginTop: '30px'
          }}>
            {trilhas.map((trilha) => (
              <div
                key={trilha.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
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

                <div style={{ padding: '20px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '10px', color: 'var(--primary)' }}>
                    {trilha.nome}
                  </h3>

                  {trilha.sinopse && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '15px' }}>
                      {trilha.sinopse}
                    </p>
                  )}

                  <button
                    onClick={() => handleComprar(trilha)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'var(--primary)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    💳 Adquirir Acesso
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
