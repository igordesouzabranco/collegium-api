import Aluno from '../models/Aluno.js';
import Avaliacao from '../models/Avaliacao.js';
import Nota from '../models/Nota.js';
import AppError from '../helpers/AppError.js';

// Regra 3: o aluno precisa estar na turma da avaliação
export async function validarAlunoNaAvaliacao({ alunoId, avaliacaoId }) {
  const aluno = await Aluno.findByPk(alunoId);
  if (!aluno) {
    throw new AppError(400, ['Aluno não encontrado']);
  }

  const avaliacao = await Avaliacao.findByPk(avaliacaoId);
  if (!avaliacao) {
    throw new AppError(400, ['Avaliação não encontrada']);
  }

  if (aluno.turmaId !== avaliacao.turmaId) {
    throw new AppError(400, ['O aluno não pertence à turma da avaliação']);
  }
}

// POST /avaliacoes/:id/notas/lote -> lança as notas da turma de uma vez
// Tudo ou nada: se um item falhar, nenhuma nota é gravada (transação)
export async function lancarNotasLote(avaliacaoId, { notas } = {}) {
  const avaliacao = await Avaliacao.findByPk(avaliacaoId);
  if (!avaliacao) {
    throw new AppError(404, ['Avaliação não encontrada']);
  }
  if (!Array.isArray(notas) || notas.length === 0) {
    throw new AppError(400, ['Informe a lista de notas em "notas"']);
  }

  const transacao = await Nota.sequelize.transaction();
  const criadas = [];
  try {
    for (const item of notas) {
      if (!item.alunoId) {
        throw new AppError(400, ['Aluno não informado na lista de notas']);
      }

      // Regra 3: só aluno matriculado na turma da avaliação
      await validarAlunoNaAvaliacao({ alunoId: item.alunoId, avaliacaoId: avaliacao.id });

      criadas.push(await Nota.create({
        valor: item.valor,
        alunoId: item.alunoId,
        avaliacaoId: avaliacao.id,
      }, { transaction: transacao }));
    }

    await transacao.commit();
  } catch (error) {
    await transacao.rollback();
    throw error;
  }

  // Devolve só as notas desta chamada, com o aluno e a avaliação junto
  return Nota.findAll({
    where: { id: criadas.map((nota) => nota.id) },
    include: [
      { model: Aluno, as: 'aluno' },
      { model: Avaliacao, as: 'avaliacao' },
    ],
    order: [['id', 'ASC']],
  });
}
