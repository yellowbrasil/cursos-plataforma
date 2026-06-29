'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import axios from 'axios';

export default function AlunoPerfil() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [token, setToken] = useState(null);
  const router = useRouter();

  // Formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/login');
      return;
    }
    setToken(t);
    carregarPerfil(t);
  }, [router]);

  const carregarPerfil = async (t) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/perfil`,
        { headers: { Authorization: `Bearer ${t}` } }
      );
      setUsuario(response.data);
      setNome(response.data.nome || '');
      setEmail(response.data.email || '');
      setWhatsapp(response.data.whatsapp || '');
    } catch (erro) {
      console.error('Erro ao carregar perfil:', erro);
      setMensagem('❌ Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');

    try {
      if (!nome.trim() || !email.trim()) {
        setMensagem('❌ Nome e email são obrigatórios');
        setSalvando(false);
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/perfil`,
        { nome, email, whatsapp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMensagem('✅ Perfil atualizado com sucesso!');
      setUsuario(response.data.usuario);
      setTimeout(() => setMensagem(''), 3000);
    } catch (erro) {
      const msgErro = erro.response?.data?.erro || 'Erro ao salvar perfil';
      setMensagem(`❌ ${msgErro}`);
    } finally {
      setSalvando(false);
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
      <div className="container" style={{ marginTop: '40px', maxWidth: '500px', marginBottom: '60px' }}>
        <h1 style={{ marginBottom: '30px' }}>
          <span className="pulse" style={{ marginRight: '12px' }}></span>Meu Perfil
        </h1>

        <form onSubmit={handleSalvar} className="card" style={{ padding: '24px' }}>
          {/* Nome */}
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: 'var(--text)',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@example.com"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: 'var(--text)',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            />
          </div>

          {/* WhatsApp */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label htmlFor="whatsapp">WhatsApp (com DDD)</label>
            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(11) 99999-9999 ou +55 11 99999-9999"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: 'var(--text)',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            />
            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Formato: (11) 9999-9999 ou +55 11 99999-9999
            </small>
          </div>

          {/* Mensagem */}
          {mensagem && (
            <div
              style={{
                padding: '12px',
                borderRadius: '4px',
                marginTop: '20px',
                marginBottom: '20px',
                fontSize: '13px',
                backgroundColor: mensagem.includes('✅')
                  ? 'rgba(81, 207, 102, 0.1)'
                  : 'rgba(255, 107, 107, 0.1)',
                color: mensagem.includes('✅') ? '#51cf66' : '#ff6b6b',
              }}
            >
              {mensagem}
            </div>
          )}

          {/* Botão Salvar */}
          <button
            type="submit"
            disabled={salvando}
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '12px',
              fontSize: '14px',
              cursor: salvando ? 'not-allowed' : 'pointer',
              opacity: salvando ? 0.6 : 1,
            }}
          >
            {salvando ? '💾 Salvando...' : '💾 Salvar Mudanças'}
          </button>
        </form>

        {/* Voltar */}
        <button
          onClick={() => router.push('/aluno/dashboard')}
          className="btn-secondary"
          style={{
            width: '100%',
            marginTop: '15px',
            padding: '12px',
          }}
        >
          ← Voltar ao Dashboard
        </button>
      </div>
    </>
  );
}
