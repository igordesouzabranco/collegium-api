'use strict';
const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [disciplinas, cursos, vinculos] = await Promise.all([
      queryInterface.sequelize.query('SELECT id, nome FROM disciplinas', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT id, nome FROM cursos', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT disciplinaId, cursoId FROM disciplinas_cursos', { type: QueryTypes.SELECT }),
    ]);

    const idDisciplina = new Map(disciplinas.map((d) => [d.nome, d.id]));
    const idCurso = new Map(cursos.map((c) => [c.nome, c.id]));
    const jaVinculado = new Set(vinculos.map((v) => `${v.disciplinaId}:${v.cursoId}`));

    // Disciplina só entra nos cursos em que é ministrada
    const pares = [
      ['Lógica de Programação', 'Desenvolvimento de Sistemas'],
      ['Banco de Dados', 'Desenvolvimento de Sistemas'],
      ['Desenvolvimento Web', 'Desenvolvimento de Sistemas'],
      ['Gestão de Processos', 'Técnico em Administração'],
      ['Empreendedorismo', 'Técnico em Administração'],
      ['Redes de Computadores', 'Redes de Computadores'],
    ];

    const novos = pares
      .map(([disciplina, curso]) => ({
        disciplinaId: idDisciplina.get(disciplina),
        cursoId: idCurso.get(curso),
      }))
      .filter((par) => par.disciplinaId && par.cursoId)
      .filter((par) => !jaVinculado.has(`${par.disciplinaId}:${par.cursoId}`));

    if (novos.length > 0) {
      await queryInterface.bulkInsert('disciplinas_cursos', novos, {});
    }
  },

  // Seeds de demonstração não são reversíveis: zere tudo com db:migrate:undo:all
  async down() {},
};
