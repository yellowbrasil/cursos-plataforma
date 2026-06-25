'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioLocal = localStorage.getItem('usuario');

    if (usuarioLocal) {
      setUsuario(JSON.parse(usuarioLocal));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link href="/" className="logo">
          <span className="pulse"></span>Cursos
        </Link>

        <nav className="nav-links">
          {usuario ? (
            <>
              <span className="text-muted">
                {usuario.nome}
              </span>
              {usuario.tipo === 'professor' && (
                <Link href="/professor/dashboard">Dashboard</Link>
              )}
              {usuario.tipo === 'aluno' && (
                <>
                  <Link href="/aluno/dashboard">Minhas Trilhas</Link>
                  <Link href="/aluno/explorar">Explorar</Link>
                </>
              )}
              <Link href="/perfil">Perfil</Link>
              <button onClick={handleLogout} className="btn-secondary">
                Sair
              </button>
            </>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
