'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import './professor.css';

export default function ProfessorDashboardPage() {
  const [trilhas, setTrilhas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const router = useRouter();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchTrilhas();
  }, [token]);

  const fetchTrilhas = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trilhas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrilhas(response.data);
    } catch (erro) {
      console.error('Erro:', erro);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarTrilha = async (e) => {
    e.preventDefault();
    setErro('');

    if (!nome) {
      setErro('Nome da trilha é obrigatório');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trilhas`,
        { nome, descricao },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTrilhas([...trilhas, response.data]);
      setNome('');
      setDescricao('');
      setShowForm(false);
    } catch (erro) {
      setErro(erro.response?.data?.erro || 'Erro ao criar trilha');
    }
  };

  const handleDeletarTrilha = async (id) => {
    if (!window.confirm('Deseja deletar esta trilha?')) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trilhas/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTrilhas(trilhas.filter((t) => t.id !== id));
    } catch (erro) {
      alert('Erro ao deletar trilha');
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Minhas Trilhas</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancelar' : '+ Nova Trilha'}
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <h2>Criar Nova Trilha</h2>
            <form onSubmit={handleCriarTrilha}>
              <div className="form-group">
                <label htmlFor="nome">Nome da Trilha *</label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="ex: Marketing Digital"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o conteúdo da trilha..."
                  rows="4"
                />
              </div>

              {erro && <div className="error">{erro}</div>}

              <button type="submit" className="btn-primary">
                Criar Trilha
              </button>
            </form>
          </div>
        )}

        {trilhas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Você ainda não criou nenhuma trilha.</p>
        ) : (
          <div className="trilhas-grid">
            {trilhas.map((trilha) => (
              <div key={trilha.id} className="card">
                <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>
                  {trilha.nome}
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
                  {trilha.descricao}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => router.push(`/professor/trilha/${trilha.id}`)}
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    Gerenciar
                  </button>
                  <button
                    onClick={() => handleDeletarTrilha(trilha.id)}
                    className="btn-secondary"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
