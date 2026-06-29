import jwt from 'jsonwebtoken';

export const verificarJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('ERRO CRÍTICO: JWT_SECRET não está definido!');
    return res.status(500).json({ erro: 'Erro na configuração do servidor' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario_id = decoded.usuario_id;
    req.tipo_usuario = decoded.tipo;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

export const verificarProfessor = (req, res, next) => {
  if (req.tipo_usuario !== 'professor' && req.tipo_usuario !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas professores.' });
  }
  next();
};

export const verificarAluno = (req, res, next) => {
  if (req.tipo_usuario !== 'aluno') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas alunos.' });
  }
  next();
};
