'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import ProfessorMenu from '@/components/ProfessorMenu';
import Footer from '@/components/Footer';

export default function AlunosPage() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [busca, setBusca] = useState('');
  const [showFormCriar, setShowFormCriar] = useState(false);
  const [showFormEditar, setShowFormEditar] = useState(false);
  const [alunoEditando, setAlunoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    senha: ''
  });
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/login');
      return;
    }
    setToken(t);
    fetchAlunos(t);
  }, [router]);

  const fetchAlunos = async (t, buscaTerms = '') => {
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/alunos`);
      if (buscaTerms) {
        url.searchParams.append('busca', buscaTerms);
      }

      const response = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${t}` }
      });
      setAlunos(response.data);
    } catch (erro) {
      console.error('Erro:', erro);
      alert('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const handleBusca = (e) => {
    const termo = e.target.value;
    setBusca(termo);
    if (termo.length > 0) {
      fetchAlunos(token, termo);
    } else {
      fetchAlunos(token);
    }
  };

  const handleCriarAluno = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.senha) {
      alert('Nome, email e senha são obrigatórios');
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/alunos`,
        {
          nome: formData.nome,
          email: formData.email,
          whatsapp: formData.whatsapp,
          senha: formData.senha
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Aluno criado com sucesso!');
      setFormData({ nome: '', email: '', whatsapp: '', senha: '' });
      setShowFormCriar(false);
      fetchAlunos(token, busca);
    } catch (erro) {
      alert(erro.response?.data?.erro || 'Erro ao criar aluno');
    }
  };

  const handleToggleStatus = async (alunoId, alunoAtivo) => {
    if (!window.confirm(`Tem certeza? Isso vai ${alunoAtivo ? 'desativar' : 'ativar'} o aluno.`)) {
      return;
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/alunos/${alunoId}/status`,
        { ativo: !alunoAtivo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Status atualizado com sucesso!');
      fetchAlunos(token, busca);
    } catch (erro) {
      alert(erro.response?.data?.erro || 'Erro ao atualizar status');
    }
  };

  const handleExcluir = async (alunoId) => {
    if (!window.confirm('Tem certeza? Esta ação é irreversível (soft delete).')) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/alunos/${alunoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Aluno removido com sucesso!');
      fetchAlunos(token, busca);
    } catch (erro) {
      alert(erro.response?.data?.erro || 'Erro ao remover aluno');
    }
  };

  const handleEditarTrilhas = (aluno) => {
    setAlunoEditando(aluno);
    setShowFormEditar(true);
  };

  if (loading) {
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
      <ProfessorMenu />
      <div className="container" style={{ marginTop: '40px', marginBottom: '60px', marginLeft: '250px' }}>
        <h1 style={{ marginBottom: '30px' }}>
          <span className="pulse" style={{ marginRight: '12px' }}></span>Gerenciar Alunos
        </h1>

        {/* Barra de ferramentas */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={busca}
            onChange={handleBusca}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={() => setShowFormCriar(!showFormCriar)}
            className="btn-primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            {showFormCriar ? 'Cancelar' : '+ Novo Aluno'}
          </button>
        </div>

        {/* Formulário de criação */}
        {showFormCriar && (
          <div
            className="card"
            style={{ marginBottom: '30px', padding: '20px', borderLeft: '4px solid var(--primary)' }}
          >
            <h2 style={{ fontSize: '18px', marginTop: 0, marginBottom: '20px' }}>Criar Novo Aluno</h2>
            <form onSubmit={handleCriarAluno}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+55 11 99999-9999"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    Senha (mín. 8 caracteres) *
                  </label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary">
                Criar Aluno
              </button>
            </form>
          </div>
        )}

        {/* Tabela de alunos */}
        <div className="card" style={{ overflowX: 'auto' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0, marginBottom: '20px' }}>
            Alunos Cadastrados ({alunos.length})
          </h2>

          {alunos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              Nenhum aluno encontrado.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: '600' }}>
                    Nome
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: '600' }}>
                    Email
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: '600' }}>
                    WhatsApp
                  </th>
                  <th style={{ textAlign: 'center', padding: '12px', fontSize: '13px', fontWeight: '600' }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'center', padding: '12px', fontSize: '13px', fontWeight: '600' }}>
                    Trilhas
                  </th>
                  <th style={{ textAlign: 'center', padding: '12px', fontSize: '13px', fontWeight: '600' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno) => (
                  <tr
                    key={aluno.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      opacity: aluno.ativo ? 1 : 0.6
                    }}
                  >
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      <strong>{aluno.nome}</strong>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                      {aluno.email}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                      {aluno.whatsapp || '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: aluno.ativo ? '#d3f9d8' : '#ffe0e0',
                          color: aluno.ativo ? '#2b8a3e' : '#c92a2a'
                        }}
                      >
                        {aluno.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                      {aluno.trilhas_ativas}/{aluno.total_trilhas}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditarTrilhas(aluno)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#4c6ef5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleToggleStatus(aluno.id, aluno.ativo)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: aluno.ativo ? '#ff6b6b' : '#51cf66',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {aluno.ativo ? 'Bloquear' : 'Ativar'}
                        </button>

                        <button
                          onClick={() => handleExcluir(aluno.id)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#868e96',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
