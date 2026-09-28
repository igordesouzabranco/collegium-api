import Sequelize, { Model } from 'sequelize';
import bcryptjs from 'bcryptjs';

export default class Professor extends Model {
  static init(sequelize) {
    super.init({
      nomeCompleto: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Nome completo é obrigatório',
          },
          len: {
            args: [3, 100],
            msg: 'Nome completo deve ter entre 3 e 100 caracteres',
          },
        },
      },
      dataNascimento: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Data de nascimento é obrigatória',
          },
        },
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: {
          args: true,
          msg: 'Email já cadastrado',
        },
        validate: {
          notNull: {
            msg: 'Email é obrigatório',
          },
          isEmail: {
            msg: 'Email inválido',
          },
        },
      },
      password_hash: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.VIRTUAL,
        defaultValue: '',
        validate: {
          len: {
            args: [6, 255],
            msg: 'Senha deve ter entre 6 e 255 caracteres',
          },
        },
      },
    }, {
      sequelize,
      tableName: 'professores',
      // Nunca devolve o hash por padrão
      defaultScope: {
        attributes: { exclude: ['password_hash'] },
      },
      // Scope usado só no login, quando o hash é necessário
      scopes: {
        comSenha: { attributes: { include: ['password_hash'] } },
      },
    });

    this.addHook('beforeSave', async (professor) => {
      if (professor.password) {
        professor.password_hash = await bcryptjs.hash(professor.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    // N:M com disciplinas (tabela associativa sem timestamps)
    this.belongsToMany(models.Disciplina, {
      through: 'professores_disciplinas',
      foreignKey: 'professorId',
      otherKey: 'disciplinaId',
      as: 'disciplinas',
      timestamps: false,
    });
    this.hasMany(models.Avaliacao, { foreignKey: 'professorId', as: 'avaliacoes' });
  }

  checkPassword(password) {
    return bcryptjs.compareSync(password, this.password_hash);
  }
}
