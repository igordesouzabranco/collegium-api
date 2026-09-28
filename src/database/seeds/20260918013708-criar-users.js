'use strict';
const bcrypt = require('bcryptjs');
const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const linhas = await queryInterface.sequelize.query(
      'SELECT email FROM users',
      { type: QueryTypes.SELECT },
    );
    if (linhas.some((linha) => linha.email === 'john.doe@example.com')) return;

    return queryInterface.bulkInsert('users', [{
      nome: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: await bcrypt.hash('123456', 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  // Seeds de demonstração não são reversíveis: zere tudo com db:migrate:undo:all
  async down() {},
};
