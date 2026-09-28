import Sequelize, { Model } from 'sequelize';

export default class Curso extends Model {
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
      tipo: {
        type: Sequelize.STRING(45),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Tipo é obrigatório',
          },
        },
      },
      coordenadorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    }, {
      sequelize,
      tableName: 'cursos',
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Coordenador, { foreignKey: 'coordenadorId', as: 'coordenador' });
    this.hasMany(models.Turma, { foreignKey: 'cursoId', as: 'turmas' });
    this.hasMany(models.Aluno, { foreignKey: 'cursoId', as: 'alunos' });
    // N:M com disciplinas (tabela associativa sem timestamps)
    this.belongsToMany(models.Disciplina, {
      through: 'disciplinas_cursos',
      foreignKey: 'cursoId',
      otherKey: 'disciplinaId',
      as: 'disciplinas',
      timestamps: false,
    });
  }
}
