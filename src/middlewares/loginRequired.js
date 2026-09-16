import jwt from 'jsonwebtoken';

export default function loginRequired(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const [, token] = authorization.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const { id, email } = decoded;
    req.userId = id;
    req.userEmail = email;
    return next();
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return res.status(401).json({ error: 'Token error' });
  }
}
