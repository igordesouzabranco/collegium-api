'use strict';
const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const linhas = await queryInterface.sequelize.query(
      'SELECT nome FROM cursos',
      { type: QueryTypes.SELECT },
    );
    const existentes = new Set(linhas.map((linha) => linha.nome));

    // A ordem importa: em um banco zerado DS precisa cair no id 2 (usado pelos testes)
    const candidatos = [
      { nome: 'Técnico em Administração', tipo: 'Tecnico', coordenadorId: 1 },
      { nome: 'Desenvolvimento de Sistemas', tipo: 'Tecnico', coordenadorId: 2 },
      { nome: 'Redes de Computadores', tipo: 'Tecnico', coordenadorId: 1 },
    ].filter((curso) => !existentes.has(curso.nome));

    if (candidatos.length === 0) return;

    const agora = new Date();
    await queryInterface.bulkInsert(
      'cursos',
      candidatos.map((curso) => ({ ...curso, createdAt: agora, updatedAt: agora })),
      {},
    );
  },

  // Seeds de demonstração não são reversíveis: zere tudo com db:migrate:undo:all
  async down() {},
};
