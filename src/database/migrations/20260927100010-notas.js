/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      valor: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
      },
      // Nota do aluno morre junto com o aluno
      alunoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'alunos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Sem avaliação não existe nota
      avaliacaoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'avaliacoes', key: 'id' },
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

    // Uma nota por aluno em cada avaliação
    await queryInterface.addConstraint('notas', {
      fields: ['alunoId', 'avaliacaoId'],
      type: 'unique',
      name: 'notas_alunoId_avaliacaoId_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notas');
  },
};
