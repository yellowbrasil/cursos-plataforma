'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProfessorMenu() {
  const [configAberta, setConfigAberta] = useState(false);
  const pathname = usePathname();

  const isAtivo = (path) => pathname.startsWith(path);
  const isConfigAtivo = pathname.startsWith('/professor/configuracoes');

  return (
    <div style={{
      width: '250px',
      backgroundColor: '#1a1a1a',
      borderRight: '1px solid var(--border)',
      padding: '20px 0',
      height: '100vh',
      overflowY: 'auto',
      position: 'fixed',
      left: 0,
      top: '60px',
      zIndex: '100',
    }}>
      {/* Dashboard */}
      <Link href="/professor/dashboard">
        <div style={{
          padding: '12px 20px',
          color: isAtivo('/professor/dashboard') && !isConfigAtivo ? 'var(--primary)' : 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.3s',
          borderLeft: isAtivo('/professor/dashboard') && !isConfigAtivo ? '3px solid var(--primary)' : '3px solid transparent',
          paddingLeft: '17px',
        }}
        onMouseEnter={(e) => {
          if (!isAtivo('/professor/dashboard')) {
            e.currentTarget.style.color = 'var(--text)';
            e.currentTarget.style.backgroundColor = '#222';
          }
        }}
        onMouseLeave={(e) => {
          if (!isAtivo('/professor/dashboard')) {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
        >
          📊 Dashboard
        </div>
      </Link>

      {/* Alunos */}
      <Link href="/professor/alunos">
        <div style={{
          padding: '12px 20px',
          color: isAtivo('/professor/alunos') ? 'var(--primary)' : 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.3s',
          borderLeft: isAtivo('/professor/alunos') ? '3px solid var(--primary)' : '3px solid transparent',
          paddingLeft: '17px',
        }}
        onMouseEnter={(e) => {
          if (!isAtivo('/professor/alunos')) {
            e.currentTarget.style.color = 'var(--text)';
            e.currentTarget.style.backgroundColor = '#222';
          }
        }}
        onMouseLeave={(e) => {
          if (!isAtivo('/professor/alunos')) {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
        >
          👥 Alunos
        </div>
      </Link>

      {/* Configurações (com submenu) */}
      <div>
        <div
          onClick={() => setConfigAberta(!configAberta)}
          style={{
            padding: '12px 20px',
            color: isConfigAtivo ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.3s',
            borderLeft: isConfigAtivo ? '3px solid var(--primary)' : '3px solid transparent',
            paddingLeft: '17px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => {
            if (!isConfigAtivo) {
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.backgroundColor = '#222';
            }
          }}
          onMouseLeave={(e) => {
            if (!isConfigAtivo) {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <span>⚙️ Configurações</span>
          <span style={{ fontSize: '12px', transform: configAberta ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
        </div>

        {/* Submenu */}
        {configAberta && (
          <div style={{ backgroundColor: '#0f0f0f', borderLeft: '1px solid var(--border)' }}>
            <Link href="/professor/configuracoes?tab=banner">
              <div style={{
                padding: '10px 20px 10px 40px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.backgroundColor = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              >
                🖼️ Banner
              </div>
            </Link>

            <Link href="/professor/configuracoes?tab=avisos">
              <div style={{
                padding: '10px 20px 10px 40px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.backgroundColor = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              >
                📢 Avisos
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
