// ⚠️ JWT NO FRONTEND NUNCA DEVE VALIDAR A ASSINATURA
// Apenas decodificamos para ler claims, mas confiamos no servidor para validação

export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return decoded;
  } catch {
    return null;
  }
};

export const verificarProfessor = (decoded) => decoded?.tipo === 'professor' || decoded?.tipo === 'admin';
export const verificarAluno = (decoded) => decoded?.tipo === 'aluno';
