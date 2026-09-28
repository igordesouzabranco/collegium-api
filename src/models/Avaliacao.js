import Sequelize, { Model } from 'sequelize';

export default class Avaliacao extends Model {
  static init(sequelize) {
    super.init({
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Nome é obrigatório',
          },
          len: {
            args: [3, 100],
            msg: 'Nome deve ter entre 3 e 100 caracteres',
          },
        },
      },
      data: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Data é obrigatória',
          },
        },
      },
      disciplinaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Disciplina é obrigatória',
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
      professorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Professor é obrigatório',
          },
        },
      },
    }, {
      sequelize,
      tableName: 'avaliacoes',
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Disciplina, { foreignKey: 'disciplinaId', as: 'disciplina' });
    this.belongsTo(models.Turma, { foreignKey: 'turmaId', as: 'turma' });
    this.belongsTo(models.Professor, { foreignKey: 'professorId', as: 'professor' });
    this.hasMany(models.Nota, { foreignKey: 'avaliacaoId', as: 'notas' });
  }
}
