import Sequelize, { Model } from 'sequelize';
import bcryptjs from 'bcryptjs';

export default class User extends Model {
  static init(sequelize) {
    super.init({
        nome: {
          type: Sequelize.STRING,
          defaultValue: '',
          validate: {
            len: {
              args: [3, 255],
              msg: 'Nome deve ter entre 3 e 255 caracteres',
            },
          },
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          defaultValue: '',
          unique: {
            args: true,
            msg: 'Email já cadastrado',
          },
          validate: {
            isEmail: {
              msg: 'Email inválido',
            },
          },
          allowNull: false,
        },
        password_hash: {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        password: {
          type: Sequelize.VIRTUAL,
          defaultValue: '',
          validate: {
            len: {
              args: [6, 255],
              msg: 'Senha deve ter entre 6 e 255 caracteres',
            },
          }
        },
      },  {
        sequelize,
        tableName: 'users',
      });

      this.addHook('beforeSave', async (user) => {
        if (user.password) {
          user.password_hash = await bcryptjs.hash(user.password, 8);
        }
      });

    return this;
}
  checkPassword(password) {
    return bcryptjs.compareSync(password, this.password_hash);
  }


}

