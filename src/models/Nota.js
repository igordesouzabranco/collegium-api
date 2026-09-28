import Sequelize, { Model } from 'sequelize';

export default class Nota extends Model {
  static init(sequelize) {
    super.init({
      valor: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        // O driver devolve DECIMAL como string: converte para número
        get() {
          const valor = this.getDataValue('valor');
          return valor === null || valor === undefined ? valor : Number(valor);
        },
        validate: {
          notNull: {
            msg: 'Valor da nota é obrigatório',
          },
          min: {
            args: [0],
            msg: 'Nota deve estar entre 0 e 10',
          },
          max: {
            args: [10],
            msg: 'Nota deve estar entre 0 e 10',
          },
          isNumber(value) {
            if (value === null || value === undefined) return;
            if (Number.isNaN(Number(value))) {
              throw new Error('Nota deve ser um número');
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
      avaliacaoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Avaliação é obrigatória',
          },
        },
      },
    }, {
      sequelize,
      tableName: 'notas',
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Aluno, { foreignKey: 'alunoId', as: 'aluno' });
    this.belongsTo(models.Avaliacao, { foreignKey: 'avaliacaoId', as: 'avaliacao' });
  }
}
