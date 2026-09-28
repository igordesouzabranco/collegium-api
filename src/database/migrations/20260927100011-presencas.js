/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('presencas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      data: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      presente: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // Presença do aluno morre junto com o aluno
      alunoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'alunos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Chamada é feita por turma
      turmaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'turmas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Uma chamada por aluno, por turma, por dia
    await queryInterface.addConstraint('presencas', {
      fields: ['alunoId', 'turmaId', 'data'],
      type: 'unique',
      name: 'presencas_alunoId_turmaId_data_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('presencas');
  },
};
