import Aluno from '../models/Aluno.js';
import Presenca from '../models/Presenca.js';
import Turma from '../models/Turma.js';
import AppError from '../helpers/AppError.js';

// Regra 4: o aluno precisa estar na turma informada
export async function validarAlunoNaTurma({ alunoId, turmaId }) {
  const aluno = await Aluno.findByPk(alunoId);
  if (!aluno) {
    throw new AppError(400, ['Aluno não encontrado']);
  }

  if (aluno.turmaId !== Number(turmaId)) {
    throw new AppError(400, ['O aluno não pertence à turma informada']);
  }
}

// POST /turmas/:id/chamada -> chama a turma inteira de uma vez
// Tudo ou nada: se algum item falhar, nada é gravado (transação)
export async function registrarChamada(turmaId, { data, presencas } = {}) {
  const turma = await Turma.findByPk(turmaId);
  if (!turma) {
    throw new AppError(404, ['Turma não encontrada']);
  }
  if (!data) {
    throw new AppError(400, ['Data é obrigatória']);
  }
  if (!Array.isArray(presencas) || presencas.length === 0) {
    throw new AppError(400, ['Informe a lista de presenças em "presencas"']);
  }

  const transacao = await Presenca.sequelize.transaction();
  const criadas = [];
  try {
    for (const item of presencas) {
      if (!item.alunoId) {
        throw new AppError(400, ['Aluno não informado na lista de presenças']);
      }

      // Regra 4: só aluno matriculado nesta turma
      await validarAlunoNaTurma({ alunoId: item.alunoId, turmaId: turma.id });

      criadas.push(await Presenca.create({
        data,
        presente: item.presente === undefined || item.presente === null ? true : item.presente,
        alunoId: item.alunoId,
        turmaId: turma.id,
      }, { transaction: transacao }));
    }

    await transacao.commit();
  } catch (error) {
    await transacao.rollback();
    throw error;
  }

  // Devolve só as chamadas desta chamada, com o aluno junto
  return Presenca.findAll({
    where: { id: criadas.map((presenca) => presenca.id) },
    include: [{ model: Aluno, as: 'aluno' }],
    order: [['id', 'ASC']],
  });
}
