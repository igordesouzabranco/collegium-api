'use strict';
const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [linhas, cursos] = await Promise.all([
      queryInterface.sequelize.query('SELECT nome FROM turmas', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT id, nome FROM cursos', { type: QueryTypes.SELECT }),
    ]);
    const existentes = new Set(linhas.map((linha) => linha.nome));
    const idCurso = new Map(cursos.map((curso) => [curso.nome, curso.id]));

    // A ordem importa: em um banco zerado DS-2026/1 precisa cair no id 2 (usado pelos testes)
    const candidatos = [
      { nome: 'ADM-2026/1', turno: 'Manha', curso: 'Técnico em Administração' },
      { nome: 'DS-2026/1', turno: 'Noite', curso: 'Desenvolvimento de Sistemas' },
      { nome: 'DS-2026/2', turno: 'Manha', curso: 'Desenvolvimento de Sistemas' },
      { nome: 'RC-2026/1', turno: 'Tarde', curso: 'Redes de Computadores' },
    ].filter((turma) => !existentes.has(turma.nome));

    if (candidatos.length === 0) return;

    const agora = new Date();
    await queryInterface.bulkInsert(
      'turmas',
      candidatos.map((turma) => ({
        nome: turma.nome,
        turno: turma.turno,
        cursoId: idCurso.get(turma.curso),
        createdAt: agora,
        updatedAt: agora,
      })),
      {},
    );
  },

  // Seeds de demonstração não são reversíveis: zere tudo com db:migrate:undo:all
  async down() {},
};
