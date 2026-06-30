'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import ProfessorMenu from '@/components/ProfessorMenu';
import './professor.css';

export default function ProfessorDashboardPage() {
  const [trilhas, setTrilhas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [sinopse, setSinopse] = useState('');
  const [linkAsaasTrilha, setLinkAsaasTrilha] = useState('');
  const [imagem, setImagem] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [token, setToken] = useState(null);

  // Estados para edição
  const [editandoId, setEditandoId] = useState(null);
  const [editarNome, setEditarNome] = useState('');
  const [editarSinopse, setEditarSinopse] = useState('');
  const [editarLinkAsaas, setEditarLinkAsaas] = useState('');
  const [editarImagem, setEditarImagem] = useState(null);
  const [editarPreviewImagem, setEditarPreviewImagem] = useState(null);
  const [erroEdicao, setErroEdicao] = useState('');

  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/login');
      return;
    }
    setToken(t);
    fetchTrilhas(t);

    // Abrir formulário automaticamente se param ?criar=true
    const params = new URLSearchParams(window.location.search);
    if (params.get('criar') === 'true') {
      setShowForm(true);
      // Limpar a query string
      window.history.replaceState({}, document.title, '/professor/dashboard');
    }
  }, [router]);

  const fetchTrilhas = async (t) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trilhas`,
        { headers: { Authorization: `Bearer ${t}` } }
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

    try {
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('sinopse', sinopse);
      formData.append('link_asaas', linkAsaasTrilha);
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
      setSinopse('');
      setLinkAsaasTrilha('');
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

  const handleAbrirEdicao = (trilha) => {
    setEditandoId(trilha.id);
    setEditarNome(trilha.nome || '');
    setEditarSinopse(trilha.sinopse || '');
    setEditarLinkAsaas(trilha.link_asaas || '');
    setEditarImagem(null);
    setEditarPreviewImagem(null);
    setErroEdicao('');
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setErroEdicao('');
  };

  const handleAtualizarTrilha = async (e) => {
    e.preventDefault();
    setErroEdicao('');

    try {
      const formData = new FormData();
      formData.append('nome', editarNome);
      formData.append('sinopse', editarSinopse);
      formData.append('link_asaas', editarLinkAsaas);
      if (editarImagem) {
        formData.append('imagem', editarImagem);
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trilhas/${editandoId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Atualizar trilha na lista
      setTrilhas(trilhas.map((t) => (t.id === editandoId ? response.data : t)));
      setEditandoId(null);
    } catch (erro) {
      setErroEdicao(erro.response?.data?.erro || 'Erro ao atualizar trilha');
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
      <ProfessorMenu />
      <div className="container" style={{ marginTop: '40px', marginLeft: '250px' }}>
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
                <label htmlFor="sinopse">Sinopse Breve</label>
                <textarea
                  id="sinopse"
                  value={sinopse}
                  onChange={(e) => setSinopse(e.target.value)}
                  placeholder="Resumo breve do que se trata este curso (aparece abaixo da trilha)..."
                  rows="2"
                  maxLength="200"
                />
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  {sinopse.length}/200 caracteres
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="linkAsaasTrilha">Link Asaas (Compra/Autorização) - Opcional</label>
                <input
                  id="linkAsaasTrilha"
                  type="url"
                  value={linkAsaasTrilha}
                  onChange={(e) => setLinkAsaasTrilha(e.target.value)}
                  placeholder="https://asaas.com/... (deixe em branco se não tiver)"
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

        {/* MODAL DE EDIÇÃO */}
        {editandoId && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
            }}>
              <h2 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--primary)' }}>
                Editar Trilha
              </h2>

              <form onSubmit={handleAtualizarTrilha}>
                <div className="form-group">
                  <label htmlFor="editNome">Nome da Trilha</label>
                  <input
                    id="editNome"
                    type="text"
                    value={editarNome}
                    onChange={(e) => setEditarNome(e.target.value)}
                    placeholder="ex: Marketing Digital"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editSinopse">Sinopse Breve</label>
                  <textarea
                    id="editSinopse"
                    value={editarSinopse}
                    onChange={(e) => setEditarSinopse(e.target.value)}
                    placeholder="Resumo breve do que se trata este curso..."
                    rows="2"
                    maxLength="200"
                  />
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    {editarSinopse.length}/200 caracteres
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="editLinkAsaas">Link Asaas (Compra/Autorização) - Opcional</label>
                  <input
                    id="editLinkAsaas"
                    type="url"
                    value={editarLinkAsaas}
                    onChange={(e) => setEditarLinkAsaas(e.target.value)}
                    placeholder="https://asaas.com/..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editImagem">Imagem Ilustrativa (375x165) - Opcional</label>
                  <input
                    id="editImagem"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setEditarImagem(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditarPreviewImagem(reader.result);
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

                {editarPreviewImagem && (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                      Preview da nova imagem:
                    </p>
                    <img
                      src={editarPreviewImagem}
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

                {erroEdicao && <div className="error">{erroEdicao}</div>}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelarEdicao}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {trilhas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Você ainda não criou nenhuma trilha.</p>
        ) : (
          <div className="trilhas-grid">
            {trilhas.map((trilha) => (
              <div key={trilha.id} className="card">
                {trilha.id && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/api/trilhas/${trilha.id}/imagem`}
                    alt={trilha.nome}
                    style={{
                      width: '100%',
                      height: '165px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '15px',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>
                  {trilha.nome}
                </h3>
                {trilha.sinopse && (
                  <p style={{ color: 'var(--text-muted)', marginBottom: '15px', fontSize: '13px' }}>
                    {trilha.sinopse}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => router.push(`/professor/trilha/${trilha.id}`)}
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    Gerenciar
                  </button>
                  <button
                    onClick={() => handleAbrirEdicao(trilha)}
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    ✏️ Editar
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
