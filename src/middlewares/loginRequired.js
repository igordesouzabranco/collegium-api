import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async function loginRequired(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const [, token] = authorization.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const { id, email } = decoded;

    const user = await User.findOne({ where: {
      id,
      email
    } });
    if (!user) {
      return res.status(400).json({ errors: ['Usuário não encontrado'] });
    }

    req.User = user;

       req.userId = id;
    req.userEmail = email;
    return next();
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return res.status(401).json({ error: 'Token error' });
  }
}
