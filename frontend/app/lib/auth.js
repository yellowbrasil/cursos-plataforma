import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'desenvolvimento_seguro_2026_fabio_schneider_cursos';

export const verificarJWT = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

export const sign = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

export const verificarProfessor = (decoded) => decoded?.tipo === 'professor' || decoded?.tipo === 'admin';
export const verificarAluno = (decoded) => decoded?.tipo === 'aluno';
