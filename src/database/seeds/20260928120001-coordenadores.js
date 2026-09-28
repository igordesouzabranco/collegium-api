'use strict';
const { QueryTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const linhas = await queryInterface.sequelize.query(
      'SELECT email FROM coordenadores',
      { type: QueryTypes.SELECT },
    );
    const existentes = new Set(linhas.map((linha) => linha.email));

    const candidatos = [
      { nomeCompleto: 'Mariana Alves', dataNascimento: '1982-04-12', email: 'coord.academico@example.com' },
      { nomeCompleto: 'Coordenador Teste', dataNascimento: '1985-09-30', email: 'coord.teste@example.com' },
    ].filter((coordenador) => !existentes.has(coordenador.email));

    if (candidatos.length === 0) return;

    const password_hash = await bcrypt.hash('123456', 10);
    const agora = new Date();
    await queryInterface.bulkInsert(
      'coordenadores',
      candidatos.map((coordenador) => ({
        ...coordenador,
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
