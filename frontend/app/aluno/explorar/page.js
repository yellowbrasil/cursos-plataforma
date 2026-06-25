'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import axios from 'axios';

export default function ExplorarPage() {
  const [todasTrilhas, setTodasTrilhas] = useState([]);
  const [trilhasInscritas, setTrilhasInscritas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inscrevendo, setInscrevendo] = useState(null);
  const router = useRouter();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetch = async () => {
      try {
        // Buscar todas as trilhas (admin only, vamos usar uma query simples)
        const [listarRes, minhasRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/trilhas`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/inscricoes/aluno/${JSON.parse(localStorage.getItem('usuario')).id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: [] })),
        ]);

        setTodasTrilhas(listarRes.data);
        setTrilhasInscritas(minhasRes.data.map((i) => i.trilha_id));
      } catch (erro) {
        console.error('Erro:', erro);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [token]);

  const handleInscrever = async (trilhaId) => {
    setInscrevendo(trilhaId);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inscricoes`,
        { trilha_id: trilhaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTrilhasInscritas([...trilhasInscritas, trilhaId]);
      alert('Inscrito com sucesso!');
    } catch (erro) {
      alert(erro.response?.data?.erro || 'Erro ao inscrever');
    } finally {
      setInscrevendo(null);
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

  const trilhasDisponiveis = todasTrilhas.filter((t) => !trilhasInscritas.includes(t.id));

  return (
    <>
      <Header />
      <div className="container" style={{ marginTop: '40px' }}>
        <h1>Explorar Trilhas</h1>

        {trilhasDisponiveis.length === 0 ? (
          <div style={{ marginTop: '30px', color: 'var(--text-muted)' }}>
            <p>Você já está inscrito em todas as trilhas disponíveis!</p>
            <button
              onClick={() => router.push('/aluno/dashboard')}
              className="btn-primary"
              style={{ marginTop: '20px' }}
            >
              Ver Minhas Trilhas
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '30px',
            }}
          >
            {trilhasDisponiveis.map((trilha) => (
              <div key={trilha.id} className="card">
                <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>
                  {trilha.nome}
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                  {trilha.descricao}
                </p>
                <button
                  onClick={() => handleInscrever(trilha.id)}
                  disabled={inscrevendo === trilha.id}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  {inscrevendo === trilha.id ? 'Inscrevendo...' : 'Se Inscrever'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
