import Curso from '../models/Curso.js';
import Disciplina from '../models/Disciplina.js';
import Professor from '../models/Professor.js';
import Turma from '../models/Turma.js';
import AppError from '../helpers/AppError.js';

// Regra 2: disciplina precisa estar no curso da turma e
// o professor precisa lecionar essa disciplina
export async function validarVinculos({ disciplinaId, turmaId, professorId }) {
  const turma = await Turma.findByPk(turmaId);
  if (!turma) {
    throw new AppError(400, ['Turma não encontrada']);
  }

  const disciplina = await Disciplina.findByPk(disciplinaId);
  if (!disciplina) {
    throw new AppError(400, ['Disciplina não encontrada']);
  }

  const professor = await Professor.findByPk(professorId);
  if (!professor) {
    throw new AppError(400, ['Professor não encontrado']);
  }

  // disciplina x curso (tabela disciplinas_cursos)
  const noCurso = await Curso.findByPk(turma.cursoId, {
    include: { model: Disciplina, as: 'disciplinas', where: { id: disciplinaId }, required: true },
  });
  if (!noCurso) {
    throw new AppError(400, ['A disciplina não pertence ao curso da turma']);
  }

  // professor x disciplina (tabela professores_disciplinas)
  const leciona = await Professor.findByPk(professorId, {
    include: { model: Disciplina, as: 'disciplinas', where: { id: disciplinaId }, required: true },
  });
  if (!leciona) {
    throw new AppError(400, ['O professor não leciona a disciplina informada']);
  }
}
