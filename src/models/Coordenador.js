import Sequelize, { Model } from 'sequelize';
import bcryptjs from 'bcryptjs';

export default class Coordenador extends Model {
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
      tableName: 'coordenadores',
      // Nunca devolve o hash por padrão
      defaultScope: {
        attributes: { exclude: ['password_hash'] },
      },
      // Scope usado só no login, quando o hash é necessário
      scopes: {
        comSenha: { attributes: { include: ['password_hash'] } },
      },
    });

    this.addHook('beforeSave', async (coordenador) => {
      if (coordenador.password) {
        coordenador.password_hash = await bcryptjs.hash(coordenador.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    // Um coordenador pode coordenar vários cursos (FK em cursos)
    this.hasMany(models.Curso, { foreignKey: 'coordenadorId', as: 'cursos' });
  }

  checkPassword(password) {
    return bcryptjs.compareSync(password, this.password_hash);
  }
}
