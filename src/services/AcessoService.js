import User from '../models/User.js';
import Coordenador from '../models/Coordenador.js';
import Professor from '../models/Professor.js';
import AppError from '../helpers/AppError.js';

// Quem faz login: users (administrador), coordenadores e professores
const TABELAS_LOGIN = [
  { modelo: User, tabela: 'users' },
  { modelo: Coordenador, tabela: 'coordenadores' },
  { modelo: Professor, tabela: 'professores' },
];

// Regra 5: o e-mail não pode existir em nenhuma das 3 tabelas de login
export async function emailUnico(email, { tabela, id = null } = {}) {
  if (!email) return;

  for (const item of TABELAS_LOGIN) {
    const existente = await item.modelo.findOne({ where: { email } });

    // ignora o próprio registro quando está sendo atualizado
    if (existente && !(item.tabela === tabela && existente.id === id)) {
      throw new AppError(400, ['Email já cadastrado']);
    }
  }
}

// Senha vazia não deve apagar a senha existente no PUT
export function semSenhaVazia(body) {
  const dados = { ...body };
  if (!dados.password) {
    delete dados.password;
  }
  return dados;
}
