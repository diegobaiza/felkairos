import jwt from 'jsonwebtoken';
import key from '../middleware/key.js';

export default (req, res, next) => {
  let token = req.headers.authorization;
  if (token) {
    try {
      jwt.verify(token, key);
      next();
    } catch {
      res.status(200).json({ code: 0, error: 'Token de autorizacion inválido' });
    }
  } else {
    res.status(200).json({ code: 0, error: 'Token de autorizacion ausente' });
  }
};