'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import axios from 'axios';

export default function AlunoDashboardPage() {
  const [trilhas, setTrilhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchTrilhas = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trilhas`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTrilhas(response.data);
      } catch (erro) {
        console.error('Erro ao buscar trilhas:', erro);
      } finally {
        setLoading(false);
      }
    };

    fetchTrilhas();
  }, []);

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
        <h1><span className="pulse" style={{ marginRight: '12px' }}></span>Minhas Trilhas de Aprendizado</h1>

        {trilhas.length === 0 ? (
          <p style={{ marginTop: '20px', color: '#ccc' }}>
            Você não está inscrito em nenhuma trilha ainda. Contacte um professor!
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '30px',
            }}
          >
            {trilhas.map((trilha) => (
              <Link key={trilha.id} href={`/aluno/trilha/${trilha.id}`}>
                <div className="card" style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
                  {trilha.imagem_url && (
                    <img
                      src={trilha.imagem_url}
                      alt={trilha.nome}
                      style={{
                        width: '100%',
                        height: '165px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        marginBottom: '15px',
                      }}
                    />
                  )}
                  <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>
                    {trilha.nome}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
                    {trilha.descricao}
                  </p>
                  <div style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    Acessar Trilha →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
