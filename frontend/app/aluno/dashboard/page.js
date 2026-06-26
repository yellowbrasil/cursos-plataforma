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

  return (
    <>
      <Header />

      {/* Banner em tela cheia */}
      {config.banner_url && (
        <div style={{
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginTop: '20px',
          marginBottom: '40px',
        }}>
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/api/configuracoes/banner/download`}
            alt="Banner Principal AI PRO ACADEMY"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
            loading="eager"
          />
        </div>
      )}

      <div className="container" style={{ marginTop: '40px' }}>


        {config.aviso_alunos && (
          <div style={{
            backgroundColor: 'var(--primary)',
            color: '#000',
            padding: '16px',
            borderRadius: '4px',
            marginBottom: '30px',
            fontWeight: '600',
            fontSize: '14px',
            lineHeight: '1.5',
          }}>
            📢 {config.aviso_alunos}
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
                      {trilha.id && (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/api/trilhas/${trilha.id}/imagem`}
                          alt={trilha.nome}
                          style={{
                            width: '100%',
                            height: '165px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            marginBottom: '15px',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
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
                    {trilha.id && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/api/trilhas/${trilha.id}/imagem`}
                        alt={trilha.nome}
                        style={{
                          width: '100%',
                          height: '165px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          marginBottom: '15px',
                          opacity: 0.6,
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>
                      {trilha.nome}
                    </h3>
                    {trilha.sinopse && (
                      <p style={{ color: 'var(--text-muted)', marginBottom: '15px', fontSize: '13px' }}>
                        {trilha.sinopse}
                      </p>
                    )}
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
