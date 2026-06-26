'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');

    if (token && usuario) {
      const user = JSON.parse(usuario);
      if (user.tipo === 'professor') {
        router.push('/professor/dashboard');
      } else {
        router.push('/aluno/dashboard');
      }
    }
  }, [router]);

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          }}
        >
        <div
          style={{
            textAlign: 'center',
            maxWidth: '600px',
            padding: '40px',
          }}
        >
          <div style={{ marginBottom: '30px' }}>
            <div className="pulse" style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 20px',
              animation: 'pulse-animation 2s infinite'
            }}></div>
          </div>

          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
            AI PRO ACADEMY
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-muted)',
              marginBottom: '15px',
              lineHeight: '1.6'
            }}
          >
            Bem-vindo ao seu espaço de aprendizado. Aprenda no seu próprio ritmo com cursos estruturados em trilhas, módulos e aulas.
          </p>

          <button
            onClick={() => {
              window.location.href = '/login';
            }}
            className="btn-primary"
            style={{ fontSize: '16px', padding: '15px 40px', marginTop: '20px' }}
          >
            Começar Agora
          </button>
        </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
