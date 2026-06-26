'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const isProfessor = pathname.startsWith('/professor');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioLocal = localStorage.getItem('usuario');

    if (usuarioLocal) {
      setUsuario(JSON.parse(usuarioLocal));
    }
  }, []);

  const handleLogout = () => {
    router.push('/logout');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link href="/" className="logo">
          <span className="pulse"></span>AI PRO ACADEMY
        </Link>

        <nav className="nav-links">
          {usuario ? (
            <>
              <span className="text-muted">
                {usuario.nome}
              </span>
              {!isProfessor && usuario.tipo === 'professor' && (
                <>
                  <Link href="/professor/dashboard">Dashboard</Link>
                  <Link href="/professor/alunos">Alunos</Link>
                  <Link href="/professor/configuracoes">Configurações</Link>
                </>
              )}
              {!isProfessor && usuario.tipo === 'aluno' && (
                <>
                  <Link href="/aluno/dashboard">Minhas Trilhas</Link>
                  <Link href="/aluno/explorar">Explorar</Link>
                </>
              )}
              {!isProfessor && <Link href="/perfil">Perfil</Link>}
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
