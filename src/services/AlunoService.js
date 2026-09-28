import Curso from '../models/Curso.js';
import Turma from '../models/Turma.js';
import AppError from '../helpers/AppError.js';

// Regra 1: a turma informada precisa pertencer ao curso informado
export async function validarCursoETurma(cursoId, turmaId) {
  const curso = await Curso.findByPk(cursoId);
  if (!curso) {
    throw new AppError(400, ['Curso não encontrado']);
  }

  const turma = await Turma.findByPk(turmaId);
  if (!turma) {
    throw new AppError(400, ['Turma não encontrada']);
  }

  if (turma.cursoId !== curso.id) {
    throw new AppError(400, ['A turma informada não pertence ao curso informado']);
  }
}
