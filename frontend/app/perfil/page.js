'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';

export default function PerfilPage() {
  const [usuario, setUsuario] = useState(null);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const usuarioLocal = localStorage.getItem('usuario');
    if (usuarioLocal) {
      setUsuario(JSON.parse(usuarioLocal));
    }
  }, [router]);

  const handleMudarSenha = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (novaSenha.length < 8) {
      setErro('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/mudar-senha`,
        { senha_atual: senhaAtual, nova_senha: novaSenha },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMensagem('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (erro) {
      setErro(erro.response?.data?.erro || 'Erro ao alterar senha');
    }
  };

  if (!usuario) {
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
      <div className="container" style={{ marginTop: '40px', maxWidth: '500px' }}>
        <div className="card">
          <h1 style={{ marginBottom: '30px', color: 'var(--primary)' }}><span className="pulse" style={{ marginRight: '12px' }}></span>Meu Perfil</h1>

          <div style={{ marginBottom: '30px' }}>
            <h3>Informações Pessoais</h3>
            <p style={{ marginTop: '10px' }}>
              <strong>Nome:</strong> {usuario.nome}
            </p>
            <p>
              <strong>Email:</strong> {usuario.email}
            </p>
            <p>
              <strong>Tipo:</strong> {usuario.tipo === 'professor' ? 'Professor' : 'Aluno'}
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '30px' }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>
              Mudar Senha
            </h2>

            <form onSubmit={handleMudarSenha}>
              <div className="form-group">
                <label htmlFor="senhaAtual">Senha Atual *</label>
                <input
                  id="senhaAtual"
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="novaSenha">Nova Senha *</label>
                <input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
                <small style={{ color: 'var(--text-muted)' }}>
                  Mínimo 8 caracteres
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmarSenha">Confirmar Nova Senha *</label>
                <input
                  id="confirmarSenha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
              </div>

              {erro && <div className="error">{erro}</div>}
              {mensagem && <div className="success">{mensagem}</div>}

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Alterar Senha
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
