// Forma única de responder erros da API: { errors: ['mensagem'] }
import { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import AppError from './AppError.js';

const MENSAGENS_UNICAS = {
  email: 'Email já cadastrado',
};

const MENSAGENS_COMPOSTAS = {
  'alunoId,avaliacaoId': 'Este aluno já tem nota nesta avaliação',
  'alunoId,turmaId,data': 'Chamada já registrada para este aluno nesta data',
};

export default function handleError(res, error) {
  // Atenção: UniqueConstraintError e ForeignKeyConstraintError herdam de
  // outras classes, então precisam ser checados ANTES do ValidationError.

  // Regra de negócio violada (lançada nos services) -> status escolhido
  if (error instanceof AppError) {
    return res.status(error.status).json({ errors: error.errors });
  }

  // Violação de unique (e-mail repetido, nota duplicada...) -> 409
  if (error instanceof UniqueConstraintError) {
    const campos = Object.keys(error.fields || {});
    const composta = MENSAGENS_COMPOSTAS[campos.join(',')];
    const mensagem = composta || MENSAGENS_UNICAS[campos[0]] || 'Registro já existente';
    return res.status(409).json({ errors: [mensagem] });
  }

  // FK em uso -> 409 (na exclusão, a mensagem da spec)
  if (error instanceof ForeignKeyConstraintError) {
    const sql = (error.parent?.sql || '').trim().toUpperCase();
    const mensagem = sql.startsWith('DELETE')
      ? 'Não é possível excluir: existem registros vinculados.'
      : 'Registro vinculado inválido';
    return res.status(409).json({ errors: [mensagem] });
  }

  // Violação de validação do Sequelize -> 400
  if (error instanceof ValidationError) {
    return res.status(400).json({
      errors: error.errors.map((item) => item.message),
    });
  }

  console.error(error);
  return res.status(500).json({ errors: ['Erro interno do servidor'] });
}
