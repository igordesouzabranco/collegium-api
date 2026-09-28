import Sequelize, { Model } from 'sequelize';

export default class Presenca extends Model {
  static init(sequelize) {
    super.init({
      data: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Data é obrigatória',
          },
        },
      },
      presente: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        validate: {
          notNull: {
            msg: 'Presença (presente) é obrigatória',
          },
          isBoolean(value) {
            if (value === null || value === undefined) return;
            if (value !== true && value !== false) {
              throw new Error('Presença deve ser true ou false');
            }
          },
        },
      },
      alunoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Aluno é obrigatório',
          },
        },
      },
      turmaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Turma é obrigatória',
          },
        },
      },
    }, {
      sequelize,
      tableName: 'presencas',
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Aluno, { foreignKey: 'alunoId', as: 'aluno' });
    this.belongsTo(models.Turma, { foreignKey: 'turmaId', as: 'turma' });
  }
}
