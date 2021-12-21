import Company from '../models/company.js';
import Admin from '../models/admin.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import hash from 'password-hash';
import key from '../middleware/key.js';

function authRoute(app) {

  app.post('/login', (req, res) => {
    Company.findOne({ where: { database: req.body.company } }).then(company => {
      if (company) {
        if (company.access == true) {
          User(company.database).findOne({ where: { username: req.body.username } }).then(user => {
            if (user) {
              if (hash.verify(req.body.password, user.password)) {
                if (user.access == true) {
                  const token = jwt.sign({ data: user, database: company.database, companyId: company.id }, key, { expiresIn: company.exp });
                  res.status(200).json({
                    result: true,
                    message: 'Bienvenido ' + user.name,
                    token: token
                  });
                } else {
                  res.status(200).json({ message: 'Usuario Suspendido' });
                }
              } else {
                res.status(200).json({ message: 'Contraseña Inválida' });
              }
            } else {
              res.status(200).json({ message: 'Usuario Inválido' });
            }
          });
        } else {
          res.status(200).json({ message: 'Empresa Suspendida' });
        }
      } else {
        res.status(200).json({ message: 'Empresa Inválida' });
      }
    }).catch(err => {
      res.status(200).json({ message: err });
    });
  });

  app.post('/login-admin', (req, res) => {
    Admin.findOne({ where: { username: req.body.username } }).then(user => {
      if (user) {
        if (hash.verify(req.body.password, user.password)) {
          const token = jwt.sign({ data: user, companyId: 1, type: 'admin' }, key, { expiresIn: '15m' });
          res.status(200).json({
            result: true,
            message: 'Bienvenido ' + user.name,
            token: token
          });
        } else {
          res.status(200).json({ message: 'Contraseña Inválida' });
        }
      } else {
        res.status(200).json({ message: 'Usuario Inválido' });
      }
    }).catch(err => {
      res.status(200).json({ message: err });
    });
  });

} export default authRoute;