'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, ) {
    return queryInterface.bulkInsert('users', [{
      nome: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: await bcrypt.hash('123456', 10),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down () {}
};
