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
          color: '#fff',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'all 0.3s',
          borderLeft: isAtivo('/professor/dashboard') && !isConfigAtivo ? '4px solid #fff' : '4px solid transparent',
          paddingLeft: '16px',
          fontWeight: isAtivo('/professor/dashboard') && !isConfigAtivo ? '600' : '500',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
        onMouseEnter={(e) => {
          if (!isAtivo('/professor/dashboard')) {
            e.currentTarget.style.backgroundColor = '#ff7722';
          }
        }}
        onMouseLeave={(e) => {
          if (!isAtivo('/professor/dashboard')) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
        >
          <span className="pulse" style={{ width: '8px', height: '8px' }}></span>
          Dashboard
        </div>
      </Link>

      {/* Alunos */}
      <Link href="/professor/alunos">
        <div style={{
          padding: '12px 20px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'all 0.3s',
          borderLeft: isAtivo('/professor/alunos') ? '4px solid #fff' : '4px solid transparent',
          paddingLeft: '16px',
          fontWeight: isAtivo('/professor/alunos') ? '600' : '500',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
        onMouseEnter={(e) => {
          if (!isAtivo('/professor/alunos')) {
            e.currentTarget.style.backgroundColor = '#ff7722';
          }
        }}
        onMouseLeave={(e) => {
          if (!isAtivo('/professor/alunos')) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
        >
          <span className="pulse" style={{ width: '8px', height: '8px' }}></span>
          Alunos
        </div>
      </Link>

      {/* Configurações (com submenu) */}
      <div>
        <div
          onClick={() => setConfigAberta(!configAberta)}
          style={{
            padding: '12px 20px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.3s',
            borderLeft: isConfigAtivo ? '4px solid #fff' : '4px solid transparent',
            paddingLeft: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: isConfigAtivo ? '600' : '500',
          }}
          onMouseEnter={(e) => {
            if (!isConfigAtivo) {
              e.currentTarget.style.backgroundColor = '#ff7722';
            }
          }}
          onMouseLeave={(e) => {
            if (!isConfigAtivo) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="pulse" style={{ width: '8px', height: '8px' }}></span>
            Configurações
          </span>
          <span style={{ fontSize: '12px', transform: configAberta ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
        </div>

        {/* Submenu */}
        {configAberta && (
          <div style={{ backgroundColor: '#ff7722', borderLeft: '1px solid #fff' }}>
            <Link href="/professor/configuracoes?tab=banner">
              <div style={{
                padding: '10px 20px 10px 40px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ff8833';
                e.currentTarget.style.fontWeight = '600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.fontWeight = '500';
              }}
              >
                <span className="pulse" style={{ width: '6px', height: '6px' }}></span>
                Banner
              </div>
            </Link>

            <Link href="/professor/configuracoes?tab=avisos">
              <div style={{
                padding: '10px 20px 10px 40px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ff8833';
                e.currentTarget.style.fontWeight = '600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.fontWeight = '500';
              }}
              >
                <span className="pulse" style={{ width: '6px', height: '6px' }}></span>
                Avisos
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
