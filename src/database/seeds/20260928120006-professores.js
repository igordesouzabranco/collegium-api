'use strict';
const { QueryTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const linhas = await queryInterface.sequelize.query(
      'SELECT email FROM professores',
      { type: QueryTypes.SELECT },
    );
    const existentes = new Set(linhas.map((linha) => linha.email));

    const candidatos = [
      { nomeCompleto: 'Rafael Martins', dataNascimento: '1986-02-18', email: 'prof.rafael@example.com' },
      { nomeCompleto: 'Juliana Prado', dataNascimento: '1990-07-25', email: 'prof.juliana@example.com' },
      { nomeCompleto: 'Paulo Ferreira', dataNascimento: '1978-11-03', email: 'prof.paulo@example.com' },
    ].filter((professor) => !existentes.has(professor.email));

    if (candidatos.length === 0) return;

    const password_hash = await bcrypt.hash('123456', 10);
    const agora = new Date();
    await queryInterface.bulkInsert(
      'professores',
      candidatos.map((professor) => ({
        ...professor,
        password_hash,
        createdAt: agora,
        updatedAt: agora,
      })),
      {},
    );
  },

  // Seeds de demonstração não são reversíveis: zere tudo com db:migrate:undo:all
  async down() {},
};
