import User from '../models/User.js';

class UserController {
  async store(req, res) {
    try {
      const newUser = await User.create(req.body);
      return res.json(newUser);
    } catch (errors) {
      return res.status(400).json({ errors: errors });
    }
  }

  async index(req, res) {
    try {
      const users = await User.findAll({ attributes: ['id', 'name', 'email'] });
      return res.json(users);
    } catch (errors) {
      return res.status(400).json({ errors: errors });
    }
  }

  async show(req, res) {
    try {
      const user = await User.findByPk(req.User.id);
      const { id, name, email } = user.toJSON();
      if (!user) {
        return res.status(400).json({ errors: ['Usuário não encontrado'] });
      }
      return res.json({ id, name, email });
    } catch (errors) {
      return res.status(400).json({ errors: errors });
    }
  }

async update(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ errors: ['Id não informado'] });
    }

    const user = await User.findByPk(req.User.id);
    if (!user) {
      return res.status(400).json({ errors: ['Usuário não encontrado'] });
    }

    const updatedUser = await user.update(req.body);
    return res.json({ id, name: updatedUser.name, email: updatedUser.email });
  } catch (errors) {
    const messages = errors.errors
      ? errors.errors.map(e => e.message)
      : [errors.message];
    return res.status(400).json({ errors: messages });
  }
}

  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ errors: ['Id não informado'] });
      }
      const user = await User.findByPk(req.User.id);
      if (!user) {
        return res.status(400).json({ errors: ['Usuário não encontrado'] });
      }
      // eslint-disable-next-line no-unused-vars
      const deletedUser = await user.destroy();
      return res.json(null);
    } catch (errors) {
      return res.status(400).json({ errors: errors.map(e => e.message) });
    }
  }
}

export default new UserController();
