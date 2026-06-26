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
      backgroundColor: 'var(--primary)',
      color: '#000',
      borderRight: '2px solid #ff7722',
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
          color: isAtivo('/professor/dashboard') && !isConfigAtivo ? '#000' : 'rgba(0,0,0,0.7)',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.3s',
          borderLeft: isAtivo('/professor/dashboard') && !isConfigAtivo ? '3px solid #000' : '3px solid transparent',
          paddingLeft: '17px',
          fontWeight: isAtivo('/professor/dashboard') && !isConfigAtivo ? '600' : '400',
        }}
        onMouseEnter={(e) => {
          if (!isAtivo('/professor/dashboard')) {
            e.currentTarget.style.color = '#000';
            e.currentTarget.style.backgroundColor = '#ff7722';
          }
        }}
        onMouseLeave={(e) => {
          if (!isAtivo('/professor/dashboard')) {
            e.currentTarget.style.color = 'rgba(0,0,0,0.7)';
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
          color: isAtivo('/professor/alunos') ? '#000' : 'rgba(0,0,0,0.7)',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.3s',
          borderLeft: isAtivo('/professor/alunos') ? '3px solid #000' : '3px solid transparent',
          paddingLeft: '17px',
          fontWeight: isAtivo('/professor/alunos') ? '600' : '400',
        }}
        onMouseEnter={(e) => {
          if (!isAtivo('/professor/alunos')) {
            e.currentTarget.style.color = '#000';
            e.currentTarget.style.backgroundColor = '#ff7722';
          }
        }}
        onMouseLeave={(e) => {
          if (!isAtivo('/professor/alunos')) {
            e.currentTarget.style.color = 'rgba(0,0,0,0.7)';
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
            color: isConfigAtivo ? '#000' : 'rgba(0,0,0,0.7)',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.3s',
            borderLeft: isConfigAtivo ? '3px solid #000' : '3px solid transparent',
            paddingLeft: '17px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: isConfigAtivo ? '600' : '400',
          }}
          onMouseEnter={(e) => {
            if (!isConfigAtivo) {
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.backgroundColor = '#ff7722';
            }
          }}
          onMouseLeave={(e) => {
            if (!isConfigAtivo) {
              e.currentTarget.style.color = 'rgba(0,0,0,0.7)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <span>⚙️ Configurações</span>
          <span style={{ fontSize: '12px', transform: configAberta ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
        </div>

        {/* Submenu */}
        {configAberta && (
          <div style={{ backgroundColor: '#ff7722', borderLeft: '1px solid #000' }}>
            <Link href="/professor/configuracoes?tab=banner">
              <div style={{
                padding: '10px 20px 10px 40px',
                color: '#000',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ff8833';
                e.currentTarget.style.fontWeight = '600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.fontWeight = '400';
              }}
              >
                🖼️ Banner
              </div>
            </Link>

            <Link href="/professor/configuracoes?tab=avisos">
              <div style={{
                padding: '10px 20px 10px 40px',
                color: '#000',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ff8833';
                e.currentTarget.style.fontWeight = '600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.fontWeight = '400';
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
