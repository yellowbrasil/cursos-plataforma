'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

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
      <div
        style={{
          minHeight: '100vh',
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
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
            📚 Plataforma de Cursos
          </h1>
          <p
            style={{
              fontSize: '20px',
              color: 'var(--text-muted)',
              marginBottom: '30px',
            }}
          >
            Aprenda no seu próprio ritmo com cursos estruturados em trilhas,
            módulos e aulas.
          </p>
          <button
            onClick={() => {
              window.location.href = '/login';
            }}
            className="btn-primary"
            style={{ fontSize: '16px', padding: '15px 40px' }}
          >
            Começar Agora
          </button>
        </div>
      </div>
    </>
  );
}
