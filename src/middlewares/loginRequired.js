import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Coordenador from '../models/Coordenador.js';
import Professor from '../models/Professor.js';

// Cada role guarda a conta na sua tabela
const CONTAS = {
  administrador: User,
  coordenador: Coordenador,
  professor: Professor,
};

export default async function loginRequired(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ errors: ['Token não informado'] });
  }

  const [, token] = authorization.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const { id, email, role } = decoded;

    const Conta = CONTAS[role];
    if (!Conta) {
      return res.status(401).json({ errors: ['Token inválido'] });
    }

    // Confere se a conta do role ainda existe
    const conta = await Conta.findOne({ where: { id, email } });
    if (!conta) {
      return res.status(401).json({ errors: ['Token inválido'] });
    }

    req.userId = id;
    req.userEmail = email;
    req.userRole = role;
    req.userNome = conta.nomeCompleto || conta.nome;

    return next();
  } catch {
    return res.status(401).json({ errors: ['Token inválido'] });
  }
}
