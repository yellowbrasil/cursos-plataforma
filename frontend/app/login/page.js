'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import './login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      console.log('Enviando login para:', `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`);
      console.log('Email:', email);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email, senha }
      );

      console.log('Resposta recebida:', response.data);

      const { token, usuario } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      console.log('Token e usuário salvos. Redirecionando...');

      if (usuario.tipo === 'professor' || usuario.tipo === 'admin') {
        router.push('/professor/dashboard');
      } else if (usuario.tipo === 'aluno') {
        router.push('/aluno/dashboard');
      } else {
        setErro('Tipo de usuário desconhecido: ' + usuario.tipo);
      }
    } catch (erro) {
      console.error('Erro no login:', erro);
      console.error('Status:', erro.response?.status);
      console.error('Dados:', erro.response?.data);
      setErro(erro.response?.data?.erro || 'Erro ao fazer login: ' + erro.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="login-container">
        <div className="login-card">
          <h1>Login</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            {erro && <div className="error">{erro}</div>}

            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Fazer Login'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
