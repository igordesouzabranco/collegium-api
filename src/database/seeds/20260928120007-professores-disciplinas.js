'use strict';
const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [professores, disciplinas, vinculos] = await Promise.all([
      queryInterface.sequelize.query('SELECT id, email FROM professores', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT id, nome FROM disciplinas', { type: QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT professorId, disciplinaId FROM professores_disciplinas', { type: QueryTypes.SELECT }),
    ]);

    const idProfessor = new Map(professores.map((p) => [p.email, p.id]));
    const idDisciplina = new Map(disciplinas.map((d) => [d.nome, d.id]));
    const jaVinculado = new Set(vinculos.map((v) => `${v.professorId}:${v.disciplinaId}`));

    const pares = [
      ['prof.rafael@example.com', 'Lógica de Programação'],
      ['prof.rafael@example.com', 'Desenvolvimento Web'],
      ['prof.juliana@example.com', 'Banco de Dados'],
      ['prof.juliana@example.com', 'Gestão de Processos'],
      ['prof.paulo@example.com', 'Redes de Computadores'],
      ['prof.paulo@example.com', 'Empreendedorismo'],
    ];

    const novos = pares
      .map(([professor, disciplina]) => ({
        professorId: idProfessor.get(professor),
        disciplinaId: idDisciplina.get(disciplina),
      }))
      .filter((par) => par.professorId && par.disciplinaId)
      .filter((par) => !jaVinculado.has(`${par.professorId}:${par.disciplinaId}`));

    if (novos.length > 0) {
      await queryInterface.bulkInsert('professores_disciplinas', novos, {});
    }
  },

  // Seeds de demonstração não são reversíveis: zere tudo com db:migrate:undo:all
  async down() {},
};
