import User from '../models/User';

class UserController {
  async store(req, res) {
    try {
      const newUser = await User.create(req.body);
      res.json(newUser);
    } catch (error) {
      res.status(400).json({ errors: error.errors.map(e => e.message)});
    }
  }
}

export default new UserController();
