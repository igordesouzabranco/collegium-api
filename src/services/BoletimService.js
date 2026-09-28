import Aluno from '../models/Aluno.js';
import Curso from '../models/Curso.js';
import Turma from '../models/Turma.js';
import Nota from '../models/Nota.js';
import Presenca from '../models/Presenca.js';
import Avaliacao from '../models/Avaliacao.js';
import Disciplina from '../models/Disciplina.js';
import Professor from '../models/Professor.js';
import AppError from '../helpers/AppError.js';

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

// Boletim do aluno: notas agrupadas por disciplina + presença
// A presença considera SÓ as chamadas do próprio aluno (cada aluno
// tem seus próprios registros em presencas)
export default async function montarBoletim(alunoId) {
  const aluno = await Aluno.findByPk(alunoId, {
    include: [
      { model: Curso, as: 'curso' },
      { model: Turma, as: 'turma' },
    ],
  });
  if (!aluno) {
    throw new AppError(404, ['Aluno não encontrado']);
  }

  const notas = await Nota.findAll({
    where: { alunoId: aluno.id },
    include: [
      {
        model: Avaliacao,
        as: 'avaliacao',
        include: [
          { model: Disciplina, as: 'disciplina' },
          { model: Professor, as: 'professor' },
        ],
      },
    ],
    order: [['id', 'ASC']],
  });

  // Agrupa as notas por disciplina (a avaliação carrega a disciplina)
  const disciplinas = [];
  notas.forEach((nota) => {
    const disciplina = nota.avaliacao && nota.avaliacao.disciplina;
    if (!disciplina) return;

    let grupo = disciplinas.find((item) => item.id === disciplina.id);
    if (!grupo) {
      grupo = { id: disciplina.id, nome: disciplina.nome, notas: [], media: null };
      disciplinas.push(grupo);
    }

    grupo.notas.push({
      id: nota.id,
      valor: nota.valor,
      avaliacao: {
        id: nota.avaliacao.id,
        nome: nota.avaliacao.nome,
        data: nota.avaliacao.data,
      },
    });
  });

  disciplinas.forEach((grupo) => {
    const soma = grupo.notas.reduce((total, item) => total + item.valor, 0);
    grupo.media = arredondar(soma / grupo.notas.length);
  });

  const somaTotal = notas.reduce((total, nota) => total + nota.valor, 0);

  const presencas = await Presenca.findAll({
    where: { alunoId: aluno.id },
    attributes: ['id', 'data', 'presente'],
    order: [['data', 'ASC']],
  });
  const totalAulas = presencas.length;
  const presentes = presencas.filter((item) => item.presente).length;
  const faltas = totalAulas - presentes;

  return {
    aluno: {
      id: aluno.id,
      nomeCompleto: aluno.nomeCompleto,
      email: aluno.email,
      curso: aluno.curso ? { id: aluno.curso.id, nome: aluno.curso.nome } : null,
      turma: aluno.turma ? { id: aluno.turma.id, nome: aluno.turma.nome } : null,
    },
    disciplinas,
    mediaGeral: notas.length ? arredondar(somaTotal / notas.length) : null,
    presenca: {
      totalAulas,
      presentes,
      faltas,
      percentual: totalAulas ? arredondar((presentes / totalAulas) * 100) : null,
    },
  };
}
