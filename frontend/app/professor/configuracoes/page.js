'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ConfiguracoesPage() {
  const [linkAsaas, setLinkAsaas] = useState('');
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

  const fetchConfiguracoes = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/configuracoes`);
      setLinkAsaas(response.data.link_asaas || '');
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
      formData.append('link_asaas', linkAsaas);
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

      setMensagem('Configurações salvas com sucesso!');
      setBanner(null);
      if (response.data.banner_url) {
        setPreviewBanner(response.data.banner_url);
      }

      setTimeout(() => setMensagem(''), 3000);
    } catch (erro) {
      setMensagem(erro.response?.data?.erro || 'Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <>
        <Header />
        <div className="container" style={{ marginTop: '40px' }}>
          <p>Carregando...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container" style={{ marginTop: '40px', marginBottom: '60px', maxWidth: '600px' }}>
        <h1 style={{ marginBottom: '30px' }}>
          <span className="pulse" style={{ marginRight: '12px' }}></span>Configurações do Sistema
        </h1>

        <form onSubmit={handleSalvar} className="card">
          {/* Banner Principal */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '15px' }}>
              Banner Principal (1300x400)
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
              Este banner aparece na área restrita do aluno, logo abaixo do menu.
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
                    // Validar se é imagem
                    if (!file.type.startsWith('image/')) {
                      alert('Por favor, selecione uma imagem válida (JPG, PNG, WebP)');
                      setBanner(null);
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = (event) => {
                      console.log('Preview gerado:', file.name);
                      setPreviewBanner(event.target.result);
                    };
                    reader.onerror = () => {
                      console.error('Erro ao ler arquivo');
                      alert('Erro ao ler o arquivo');
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
              <div>
                <p style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Preview do Banner:
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
                  onError={(e) => {
                    console.error('Erro ao carregar preview:', previewBanner);
                    e.target.style.border = '2px solid #ff6b6b';
                    e.target.style.backgroundColor = '#1a1a1a';
                  }}
                  onLoad={() => {
                    console.log('Preview carregado com sucesso');
                  }}
                />
              </div>
            )}
          </div>

          {/* Link Asaas */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '15px' }}>
              Link do Asaas (Pagamento)
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
              Cole aqui o link do Asaas para onde enviar os alunos para pagamento/autorização.
            </p>

            <div className="form-group">
              <label htmlFor="linkAsaas">URL do Asaas</label>
              <input
                id="linkAsaas"
                type="url"
                value={linkAsaas}
                onChange={(e) => setLinkAsaas(e.target.value)}
                placeholder="https://asaas.com/..."
              />
            </div>
          </div>

          {mensagem && (
            <div
              style={{
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '20px',
                backgroundColor: mensagem.includes('sucesso')
                  ? 'rgba(81, 207, 102, 0.1)'
                  : 'rgba(255, 107, 107, 0.1)',
                color: mensagem.includes('sucesso') ? '#51cf66' : '#ff6b6b',
                fontSize: '13px',
              }}
            >
              {mensagem}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={salvando} style={{ width: '100%' }}>
            {salvando ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
