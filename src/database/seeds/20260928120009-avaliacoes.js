'use strict';
const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [linhas, disciplinas, turmas, professores] = await Promise.all([
      queryInterface.sequelize.query('SELECT nome, data, disciplinaId FROM avaliacoes', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT id, nome FROM disciplinas', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT id, nome FROM turmas', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT id, email FROM professores', { type: QueryTypes.SELECT }),
    ]);
    const existentes = new Set(linhas.map((linha) => `${linha.nome}|${linha.data}`));
    const idDisciplina = new Map(disciplinas.map((d) => [d.nome, d.id]));
    const idTurma = new Map(turmas.map((t) => [t.nome, t.id]));
    const idProfessor = new Map(professores.map((p) => [p.email, p.id]));

    // Regra 2: disciplina no curso da turma e professor leciona a disciplina
    const candidatos = [
      { nome: 'Prova 1 - Lógica', data: '2026-10-10', disciplina: 'Lógica de Programação', turma: 'DS-2026/1', professor: 'prof.rafael@example.com' },
      { nome: 'Prova 1 - Banco de Dados', data: '2026-10-15', disciplina: 'Banco de Dados', turma: 'DS-2026/1', professor: 'prof.juliana@example.com' },
      { nome: 'Trabalho Prático - Web', data: '2026-11-05', disciplina: 'Desenvolvimento Web', turma: 'DS-2026/1', professor: 'prof.rafael@example.com' },
      { nome: 'Prova 1 - Lógica', data: '2026-10-20', disciplina: 'Lógica de Programação', turma: 'DS-2026/2', professor: 'prof.rafael@example.com' },
      { nome: 'Prova 1 - Gestão', data: '2026-10-12', disciplina: 'Gestão de Processos', turma: 'ADM-2026/1', professor: 'prof.juliana@example.com' },
      { nome: 'Prova 1 - Redes', data: '2026-10-18', disciplina: 'Redes de Computadores', turma: 'RC-2026/1', professor: 'prof.paulo@example.com' },
    ]
      .map((avaliacao) => ({
        ...avaliacao,
        nome: `${avaliacao.nome} ${avaliacao.turma}`,
        disciplinaId: idDisciplina.get(avaliacao.disciplina),
        turmaId: idTurma.get(avaliacao.turma),
        professorId: idProfessor.get(avaliacao.professor),
      }))
      .filter((avaliacao) => avaliacao.disciplinaId && avaliacao.turmaId && avaliacao.professorId)
      .filter((avaliacao) => !existentes.has(`${avaliacao.nome}|${avaliacao.data}`));

    if (candidatos.length === 0) return;

    const agora = new Date();
    await queryInterface.bulkInsert(
      'avaliacoes',
      candidatos.map((avaliacao) => ({
        nome: avaliacao.nome,
        data: avaliacao.data,
        disciplinaId: avaliacao.disciplinaId,
        turmaId: avaliacao.turmaId,
        professorId: avaliacao.professorId,
        createdAt: agora,
        updatedAt: agora,
      })),
      {},
    );
  },

  // Seeds de demonstração não são reversíveis: zere tudo com db:migrate:undo:all
  async down() {},
};
