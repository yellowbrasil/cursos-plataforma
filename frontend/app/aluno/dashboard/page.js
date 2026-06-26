'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import axios from 'axios';

export default function AlunoDashboardPage() {
  const [trilhas, setTrilhas] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchTrilhas = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trilhas/com-status/todas`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTrilhas(response.data);
      } catch (erro) {
        console.error('Erro ao buscar trilhas:', erro);
      }
    };

    const fetchData = async () => {
      try {
        await fetchTrilhas();
        await fetchConfiguracoes();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const fetchConfiguracoes = async () => {
    try {
      console.log('Buscando configurações de:', `${process.env.NEXT_PUBLIC_API_URL}/api/configuracoes`);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracoes`
      );
      console.log('Configurações recebidas:', response.data);
      setConfig(response.data);
      if (response.data.banner_url) {
        console.log('Banner URL encontrada:', response.data.banner_url);
      }
    } catch (erro) {
      console.error('Erro ao buscar configurações:', erro);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ marginTop: '40px' }}>
          <p>Carregando...</p>
        </div>
      </>
    );
  }

  console.log('Renderizando dashboard. Config:', config);

  return (
    <>
      <Header />
      <div className="container" style={{ marginTop: '40px' }}>
        {/* DEBUG VISÍVEL */}
        <div style={{
          backgroundColor: '#222',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#999',
          fontFamily: 'monospace',
        }}>
          <div>config.banner_url = {config.banner_url ? '✅ ' + config.banner_url : '❌ undefined/vazio'}</div>
          <div>config object = {JSON.stringify(config)}</div>
        </div>

        {config.banner_url ? (
          <div style={{ marginBottom: '40px' }}>
            <img
              src={config.banner_url}
              alt="Banner"
              style={{
                width: '100%',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '2px solid var(--primary)',
              }}
              onError={(e) => {
                console.error('❌ Erro ao carregar banner:', config.banner_url);
                e.target.style.display = 'none';
              }}
              onLoad={() => {
                console.log('✅ Banner carregado:', config.banner_url);
              }}
            />
          </div>
        ) : (
          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            marginBottom: '40px',
            borderLeft: '4px solid #ff6b6b',
            color: '#ff6b6b',
          }}>
            ⚠️ BANNER NÃO ENCONTRADO (config.banner_url vazio)
          </div>
        )}

        <h1><span className="pulse" style={{ marginRight: '12px' }}></span>Minhas Trilhas de Aprendizado</h1>

        {trilhas.length === 0 ? (
          <p style={{ marginTop: '20px', color: '#ccc' }}>
            Você não está inscrito em nenhuma trilha ainda. Contacte um professor!
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '30px',
            }}
          >
            {trilhas.map((trilha) => (
              <div key={trilha.id}>
                {trilha.status_inscricao === 'inscrito' ? (
                  <Link href={`/aluno/trilha/${trilha.id}`}>
                    <div className="card" style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
                      {trilha.imagem_url && (
                        <img
                          src={trilha.imagem_url}
                          alt={trilha.nome}
                          style={{
                            width: '100%',
                            height: '165px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            marginBottom: '15px',
                          }}
                        />
                      )}
                      <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>
                        {trilha.nome}
                      </h3>
                      {trilha.sinopse && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '10px', fontStyle: 'italic' }}>
                          {trilha.sinopse}
                        </p>
                      )}
                      <p style={{ color: 'var(--text-muted)', marginBottom: '15px', fontSize: '12px' }}>
                        {trilha.descricao}
                      </p>
                      <div
                        style={{
                          backgroundColor: '#51cf66',
                          color: '#000',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '13px',
                          textAlign: 'center',
                        }}
                      >
                        Acesso Liberado
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="card">
                    {trilha.imagem_url && (
                      <img
                        src={trilha.imagem_url}
                        alt={trilha.nome}
                        style={{
                          width: '100%',
                          height: '165px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          marginBottom: '15px',
                          opacity: 0.6,
                        }}
                      />
                    )}
                    <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>
                      {trilha.nome}
                    </h3>
                    {trilha.sinopse && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '10px', fontStyle: 'italic' }}>
                        {trilha.sinopse}
                      </p>
                    )}
                    <p style={{ color: 'var(--text-muted)', marginBottom: '15px', fontSize: '12px' }}>
                      {trilha.descricao}
                    </p>
                    {trilha.link_asaas ? (
                      <a
                        href={trilha.link_asaas}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'block',
                          backgroundColor: 'var(--primary)',
                          color: 'var(--bg-dark)',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '13px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          transition: 'background-color 0.3s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ff7722';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary)';
                        }}
                      >
                        Comprar Acesso
                      </a>
                    ) : (
                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '13px',
                          textAlign: 'center',
                          backgroundColor: '#444',
                          color: '#999',
                        }}
                      >
                        Indisponível
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
