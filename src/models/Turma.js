import Sequelize, { Model } from 'sequelize';

export default class Turma extends Model {
  static init(sequelize) {
    super.init({
      nome: {
        type: Sequelize.STRING(45),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Nome é obrigatório',
          },
          len: {
            args: [2, 45],
            msg: 'Nome deve ter entre 2 e 45 caracteres',
          },
        },
      },
      turno: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      cursoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Curso é obrigatório',
          },
        },
      },
    }, {
      sequelize,
      tableName: 'turmas',
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Curso, { foreignKey: 'cursoId', as: 'curso' });
    this.hasMany(models.Aluno, { foreignKey: 'turmaId', as: 'alunos' });
    this.hasMany(models.Avaliacao, { foreignKey: 'turmaId', as: 'avaliacoes' });
    this.hasMany(models.Presenca, { foreignKey: 'turmaId', as: 'presencas' });
  }
}
