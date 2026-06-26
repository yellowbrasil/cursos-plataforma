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
  const [imagem, setImagem] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
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
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('descricao', descricao);
      if (imagem) {
        formData.append('imagem', imagem);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trilhas`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setTrilhas([...trilhas, response.data]);
      setNome('');
      setDescricao('');
      setImagem(null);
      setPreviewImagem(null);
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
          <h1><span className="pulse" style={{ marginRight: '12px' }}></span>Minhas Trilhas</h1>
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

              <div className="form-group">
                <label htmlFor="imagem">Imagem Ilustrativa (375x165)</label>
                <input
                  id="imagem"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setImagem(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPreviewImagem(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{
                    padding: '8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {previewImagem && (
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                    Preview da imagem:
                  </p>
                  <img
                    src={previewImagem}
                    alt="Preview"
                    style={{
                      width: '100%',
                      maxWidth: '375px',
                      height: '165px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
              )}

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
