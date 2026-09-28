import Sequelize, { Model } from 'sequelize';

export default class Aluno extends Model {
  static init(sequelize) {
    super.init({
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
        validate: {
          len: {
            args: [1, 100],
            msg: 'Nome deve ter entre 1 e 100 caracteres',
          }
        },
      },
      sobrenome: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
        validate: {
          len: {
            args: [1, 100],
            msg: 'Sobrenome deve ter entre 1 e 100 caracteres',
          }
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
        unique: {
          args: true,
          msg: 'Email já cadastrado',
        },
        validate: {
          isEmail: {
            args: true,
            msg: 'Email inválido',
          }
        },
      },
      idade: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            args: true,
            msg: 'Idade deve ser um inteiro',
          }
        },
      },
      serie: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            args: true,
            msg: 'Série deve ser um inteiro',
          }
        },
      },
    }, {
      sequelize,
      tableName: 'alunos',
      underscored: true,
    });
    return this;
  }
}
