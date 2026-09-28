// Bloqueia perfis diferentes dos liberados -> 403
export default function authorize(...roles) {
  return function autorizar(req, res, next) {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ errors: ['Acesso negado'] });
    }

    return next();
  };
}
