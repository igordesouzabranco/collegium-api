import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Coordenador from '../models/Coordenador.js';
import Professor from '../models/Professor.js';

// Mensagem única: não revela se o e-mail existe ou se a senha está errada
const CREDENCIAIS_INVALIDAS = 'Credenciais inválidas';

// Procura o e-mail em users -> coordenadores -> professores
// (função do módulo: Express não mantém `this` no handler)
async function buscarConta(email) {
  const administrador = await User.scope('comSenha').findOne({ where: { email } });
  if (administrador) {
    return { conta: administrador, role: 'administrador', nome: administrador.nome };
  }

  const coordenador = await Coordenador.scope('comSenha').findOne({ where: { email } });
  if (coordenador) {
    return { conta: coordenador, role: 'coordenador', nome: coordenador.nomeCompleto };
  }

  const professor = await Professor.scope('comSenha').findOne({ where: { email } });
  if (professor) {
    return { conta: professor, role: 'professor', nome: professor.nomeCompleto };
  }

  return null;
}

class TokenController {
  async store(req, res) {
    const { email = '', password = '' } = req.body;

    try {
      const resultado = email && password ? await buscarConta(email) : null;

      if (!resultado || !resultado.conta.checkPassword(password)) {
        return res.status(401).json({ errors: [CREDENCIAIS_INVALIDAS] });
      }

      const { conta, role, nome } = resultado;
      const token = jwt.sign({ id: conta.id, email, role }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRES_IN,
      });

      return res.json({
        token,
        user: { id: conta.id, nome, email, role },
      });
    } catch (error) {
      console.error(error);
      return res.status(401).json({ errors: [CREDENCIAIS_INVALIDAS] });
    }
  }
}

export default new TokenController();
