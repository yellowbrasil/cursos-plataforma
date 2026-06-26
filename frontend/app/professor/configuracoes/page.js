'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import ProfessorMenu from '@/components/ProfessorMenu';
import Footer from '@/components/Footer';

export default function ConfiguracoesPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'banner';
  const [abaAtiva, setAbaAtiva] = useState(tabParam);

  const [aviso, setAviso] = useState('');
  const [banner, setBanner] = useState(null);
  const [previewBanner, setPreviewBanner] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const router = useRouter();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchConfiguracoes();
  }, [token]);

  useEffect(() => {
    setAbaAtiva(tabParam);
  }, [tabParam]);

  const fetchConfiguracoes = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/configuracoes`);
      setAviso(response.data.aviso_alunos || '');
      if (response.data.banner_url) {
        setPreviewBanner(response.data.banner_url);
      }
    } catch (erro) {
      console.error('Erro:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');

    try {
      const formData = new FormData();
      formData.append('aviso_alunos', aviso);
      if (banner) {
        formData.append('banner', banner);
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracoes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMensagem('✅ Configurações salvas com sucesso!');
      setBanner(null);
      if (response.data.banner_url) {
        setPreviewBanner(response.data.banner_url);
      }

      setTimeout(() => setMensagem(''), 3000);
    } catch (erro) {
      setMensagem('❌ ' + (erro.response?.data?.erro || 'Erro ao salvar'));
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <>
        <Header />
        <ProfessorMenu />
        <div className="container" style={{ marginTop: '40px', marginLeft: '250px' }}>
          <p>Carregando...</p>
        </div>
        <Footer />
      </>
    );
  }

  const abas = [
    { id: 'banner', label: '🖼️ Banner' },
    { id: 'avisos', label: '📢 Avisos' },
  ];

  return (
    <>
      <Header />
      <ProfessorMenu />
      <div className="container" style={{ marginTop: '40px', marginBottom: '60px', maxWidth: '600px', marginLeft: '250px' }}>
        <h1 style={{ marginBottom: '30px' }}>
          <span className="pulse" style={{ marginRight: '12px' }}></span>Configurações
        </h1>

        {/* ABAS */}
        <div style={{
          display: 'flex',
          gap: '0',
          marginBottom: '20px',
          borderBottom: '2px solid var(--border)',
        }}>
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => {
                setAbaAtiva(aba.id);
                router.push(`?tab=${aba.id}`);
              }}
              style={{
                padding: '12px 20px',
                backgroundColor: abaAtiva === aba.id ? 'var(--primary)' : 'transparent',
                color: abaAtiva === aba.id ? '#000' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '0',
                cursor: 'pointer',
                fontWeight: abaAtiva === aba.id ? '600' : '400',
                fontSize: '14px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                if (abaAtiva !== aba.id) e.target.style.backgroundColor = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                if (abaAtiva !== aba.id) e.target.style.backgroundColor = 'transparent';
              }}
            >
              {aba.label}
            </button>
          ))}
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <form onSubmit={handleSalvar} className="card">
          {/* ABA: Banner Principal */}
          {abaAtiva === 'banner' && (
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '15px' }}>
                Banner Principal
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '15px' }}>
                Dimensões: 1300 x 400 pixels
                <br />
                Aparece na área restrita do aluno, logo abaixo do menu (tela cheia).
              </p>

              <div className="form-group">
                <label htmlFor="banner">Upload Banner</label>
                <input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setBanner(file);
                    if (file) {
                      if (!file.type.startsWith('image/')) {
                        alert('Por favor, selecione uma imagem válida');
                        setBanner(null);
                        return;
                      }

                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setPreviewBanner(event.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{
                    padding: '8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                />
              </div>

              {previewBanner && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                    Preview:
                  </p>
                  <img
                    src={previewBanner}
                    alt="Preview Banner"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ABA: Avisos para Alunos */}
          {abaAtiva === 'avisos' && (
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '15px' }}>
                Avisos para Alunos
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '15px' }}>
                Mensagem que aparece em tarja laranja na área restrita do aluno.
                <br />
                Use para avisos sobre aulas novas, regras, manutenção, etc.
              </p>

              <div className="form-group">
                <label htmlFor="aviso">Mensagem de Aviso</label>
                <textarea
                  id="aviso"
                  value={aviso}
                  onChange={(e) => setAviso(e.target.value)}
                  placeholder="Ex: Nova aula adicionada à trilha de IA! Confira."
                  rows="4"
                  maxLength="500"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    backgroundColor: 'transparent',
                    color: 'var(--text)',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                  }}
                />
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  {aviso.length}/500 caracteres
                </small>
              </div>

              {aviso && (
                <div style={{
                  backgroundColor: 'var(--primary)',
                  color: '#000',
                  padding: '12px',
                  borderRadius: '4px',
                  marginTop: '15px',
                  fontSize: '13px',
                  fontWeight: '600',
                }}>
                  <span style={{ marginRight: '8px' }}>📢</span>
                  {aviso}
                </div>
              )}
            </div>
          )}

          {/* MENSAGEM E BOTÃO */}
          {mensagem && (
            <div
              style={{
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '20px',
                marginTop: '20px',
                backgroundColor: mensagem.includes('✅')
                  ? 'rgba(81, 207, 102, 0.1)'
                  : 'rgba(255, 107, 107, 0.1)',
                color: mensagem.includes('✅') ? '#51cf66' : '#ff6b6b',
                fontSize: '13px',
              }}
            >
              {mensagem}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={salvando}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {salvando ? 'Salvando...' : '💾 Salvar Configurações'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
