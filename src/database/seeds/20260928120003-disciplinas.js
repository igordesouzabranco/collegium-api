'use strict';
const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const linhas = await queryInterface.sequelize.query(
      'SELECT nome FROM disciplinas',
      { type: QueryTypes.SELECT },
    );
    const existentes = new Set(linhas.map((linha) => linha.nome));

    const candidatos = [
      'Lógica de Programação',
      'Banco de Dados',
      'Desenvolvimento Web',
      'Gestão de Processos',
      'Empreendedorismo',
      'Redes de Computadores',
    ].filter((nome) => !existentes.has(nome));

    if (candidatos.length === 0) return;

    const agora = new Date();
    await queryInterface.bulkInsert(
      'disciplinas',
      candidatos.map((nome) => ({ nome, createdAt: agora, updatedAt: agora })),
      {},
    );
  },

  // Seeds de demonstração não são reversíveis: zere tudo com db:migrate:undo:all
  async down() {},
};
