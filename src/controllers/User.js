import User from '../models/User.js';
import handleError from '../helpers/handleError.js';
import semSenha from '../helpers/semSenha.js';

class UserController {
  async index(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'nome', 'email', 'createdAt', 'updatedAt'],
        order: [['id', 'DESC']],
      });
      return res.json(users);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ errors: ['Usuário não encontrado'] });
      }
      return res.json(semSenha(user));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async store(req, res) {
    try {
      const user = await User.create(req.body);
      return res.status(201).json(semSenha(user));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ errors: ['Usuário não encontrado'] });
      }

      await user.update(req.body);
      return res.json(semSenha(user));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ errors: ['Usuário não encontrado'] });
      }

      await user.destroy();
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  }
}

export default new UserController();
