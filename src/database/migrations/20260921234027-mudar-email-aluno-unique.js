module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.changeColumn('alunos', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    })
  },

  async down () {}
};
