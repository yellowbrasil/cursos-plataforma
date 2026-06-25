'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Limpar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    // Redirecionar para login
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1>Saindo...</h1>
        <p style={{ color: '#ccc', marginTop: '10px' }}>
          Você será redirecionado para login em alguns segundos.
        </p>
      </div>
    </div>
  );
}
