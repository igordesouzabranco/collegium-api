import Sequelize, { Model } from 'sequelize';

export default class Disciplina extends Model {
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
    }, {
      sequelize,
      tableName: 'disciplinas',
    });

    return this;
  }

  static associate(models) {
    // N:M com cursos e com professores (tabelas associativas sem timestamps)
    this.belongsToMany(models.Curso, {
      through: 'disciplinas_cursos',
      foreignKey: 'disciplinaId',
      otherKey: 'cursoId',
      as: 'cursos',
      timestamps: false,
    });
    this.belongsToMany(models.Professor, {
      through: 'professores_disciplinas',
      foreignKey: 'disciplinaId',
      otherKey: 'professorId',
      as: 'professores',
      timestamps: false,
    });
    this.hasMany(models.Avaliacao, { foreignKey: 'disciplinaId', as: 'avaliacoes' });
  }
}
