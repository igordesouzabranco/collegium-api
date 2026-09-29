module.exports = {
  // ADD UNIQUE INDEX em vez de CHANGE COLUMN: o TiDB rejeita "can't change
  // column constraint (UNIQUE KEY)" (erro 8200). Mesmo resultado nos dois engines.
  async up (queryInterface) {
    await queryInterface.addIndex('alunos', ['email'], {
      unique: true,
      name: 'alunos_email_unique',
    });
  },

  async down () {}
};
