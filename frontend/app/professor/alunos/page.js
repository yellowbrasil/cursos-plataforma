'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import ProfessorMenu from '@/components/ProfessorMenu';
import Footer from '@/components/Footer';

export default function AlunosPage() {
  const [trilhas, setTrilhas] = useState([]);
  const [alunosCadastrados, setAlunosCadastrados] = useState([]);
  const [trilhaSelecionada, setTrilhaSelecionada] = useState(null);
  const [alunosSelecionados, setAlunosSelecionados] = useState([]);
  const [alunosInscritos, setAlunosInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchTrilhas();
    fetchAlunos();
  }, [token]);

  const fetchTrilhas = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trilhas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrilhas(response.data);
    } catch (erro) {
      console.error('Erro:', erro);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlunos = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/alunos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlunosCadastrados(response.data);
    } catch (erro) {
      console.error('Erro:', erro);
    }
  };

  const fetchAlunosInscritos = async (trilhaId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/alunos/trilha/${trilhaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlunosInscritos(response.data);
    } catch (erro) {
      console.error('Erro:', erro);
    }
  };

  const handleSelecionarTrilha = (trilhaId) => {
    setTrilhaSelecionada(trilhaId);
    setAlunosSelecionados([]);
    fetchAlunosInscritos(trilhaId);
  };

  const handleInscreverAlunos = async () => {
    if (alunosSelecionados.length === 0) {
      alert('Selecione pelo menos um aluno');
      return;
    }

    try {
      for (const alunoId of alunosSelecionados) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/alunos/inscrever`,
          { aluno_id: alunoId, trilha_id: trilhaSelecionada },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert('Alunos inscritos com sucesso!');
      setAlunosSelecionados([]);
      fetchAlunosInscritos(trilhaSelecionada);
    } catch (erro) {
      alert(erro.response?.data?.erro || 'Erro ao inscrever');
    }
  };

  const handleBloquearAluno = async (inscricaoId) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/alunos/bloquear/${inscricaoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Aluno bloqueado!');
      fetchAlunosInscritos(trilhaSelecionada);
    } catch (erro) {
      alert(erro.response?.data?.erro || 'Erro ao bloquear');
    }
  };

  const handleDesbloquearAluno = async (inscricaoId) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/alunos/desbloquear/${inscricaoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Aluno desbloqueado!');
      fetchAlunosInscritos(trilhaSelecionada);
    } catch (erro) {
      alert(erro.response?.data?.erro || 'Erro ao desbloquear');
    }
  };

  const handleRemoverAluno = async (inscricaoId) => {
    if (!window.confirm('Remover aluno dessa trilha?')) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/alunos/${inscricaoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Aluno removido!');
      fetchAlunosInscritos(trilhaSelecionada);
    } catch (erro) {
      alert('Erro ao remover');
    }
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

  const alunosNaoInscritos = alunosCadastrados.filter(
    (aluno) => !alunosInscritos.some((a) => a.aluno_id === aluno.id)
  );

  return (
    <>
      <Header />
      <ProfessorMenu />
      <div className="container" style={{ marginTop: '40px', marginBottom: '60px', marginLeft: '250px' }}>
        <h1 style={{ marginBottom: '30px' }}>
          <span className="pulse" style={{ marginRight: '12px' }}></span>Gerenciar Alunos
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Coluna esquerda: Trilhas */}
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--primary)' }}>
              Suas Trilhas
            </h2>

            {trilhas.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Nenhuma trilha criada.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {trilhas.map((trilha) => (
                  <button
                    key={trilha.id}
                    onClick={() => handleSelecionarTrilha(trilha.id)}
                    className={trilhaSelecionada === trilha.id ? 'btn-primary' : 'btn-secondary'}
                    style={{
                      textAlign: 'left',
                      padding: '12px',
                      fontWeight: trilhaSelecionada === trilha.id ? '600' : '400',
                    }}
                  >
                    {trilha.nome}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Coluna direita: Alunos */}
          {trilhaSelecionada && (
            <div>
              <h2 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--primary)' }}>
                Alunos da Trilha
              </h2>

              {/* Alunos inscritos */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--primary)' }}>
                  Inscritos ({alunosInscritos.length})
                </h3>

                {alunosInscritos.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Nenhum aluno inscrito.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {alunosInscritos.map((inscricao) => (
                      <div
                        key={inscricao.id}
                        className="card"
                        style={{
                          padding: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: inscricao.bloqueado ? 0.6 : 1,
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 2px 0' }}>
                            {inscricao.nome}
                          </p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                            {inscricao.email}
                          </p>
                          {inscricao.bloqueado && (
                            <p style={{ fontSize: '11px', color: '#ff6b6b', margin: '2px 0 0 0' }}>
                              Bloqueado
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          {inscricao.bloqueado ? (
                            <button
                              onClick={() => handleDesbloquearAluno(inscricao.id)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                backgroundColor: '#51cf66',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              Desbloquear
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBloquearAluno(inscricao.id)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                backgroundColor: '#ff6b6b',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                            >
                              Bloquear
                            </button>
                          )}

                          <button
                            onClick={() => handleRemoverAluno(inscricao.id)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              backgroundColor: 'var(--border)',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alunos não inscritos */}
              <div>
                <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--primary)' }}>
                  Adicionar Alunos ({alunosNaoInscritos.length})
                </h3>

                {alunosNaoInscritos.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    Todos os alunos estão inscritos.
                  </p>
                ) : (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {alunosNaoInscritos.map((aluno) => (
                        <label
                          key={aluno.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px',
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={alunosSelecionados.includes(aluno.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAlunosSelecionados([...alunosSelecionados, aluno.id]);
                              } else {
                                setAlunosSelecionados(alunosSelecionados.filter((id) => id !== aluno.id));
                              }
                            }}
                          />
                          <div style={{ fontSize: '12px' }}>
                            <p style={{ margin: 0, fontWeight: '600' }}>{aluno.nome}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                              {aluno.email}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={handleInscreverAlunos}
                      className="btn-primary"
                      style={{ width: '100%' }}
                      disabled={alunosSelecionados.length === 0}
                    >
                      Inscrever Selecionados ({alunosSelecionados.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
