import User from "../models/user.js";
import hash from 'password-hash';
import auth from '../middleware/auth.js';
import token from '../middleware/token.js';

function userRoute(app) {

  app.get('/users', auth, (req, res) => {
    User(token(req.headers.authorization)).findAll().then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/users/:id', auth, (req, res) => {
    User(token(req.headers.authorization)).findOne({ where: { id: req.params.id } }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/users', auth, (req, res) => {
    req.body.password = hash.generate(req.body.password);
    User(token(req.headers.authorization)).findOne({ where: { username: req.body.username } }).then(data => {
      if (data) {
        res.status(200).json({ result: false, message: 'Usuario ya Existente' });
      } else {
        User(token(req.headers.authorization)).create(req.body).then(data => {
          data.id = data.null;
          res.status(200).json({ result: true, message: 'Usuario Agregado', data: data });
        }).catch(err => {
          res.status(200).json({ result: false, message: err });
        });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.put('/users/:id', auth, (req, res) => {
    if (req.body.password) {
      req.body.password = hash.generate(req.body.password);  
    }
    User(token(req.headers.authorization)).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Usuario Actualizado' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.put('/users/password/:id', auth, (req, res) => {
    var password = req.body.password;
    User(token(req.headers.authorization)).findOne({ where: { id: req.params.id } }).then(data => {
      if (data) {
        if (hash.verify(password, data.password)) {
          User(token(req.headers.authorization)).update({ password: hash.generate(req.body.new_password) }, { where: { id: req.params.id } }).then(data => {
            data.id = data.null;
            res.status(200).json({ result: true, message: 'Contraseña Actualizada' });
          }).catch(err => {
            res.status(200).json({ result: false, message: err });
          });
        } else {
          res.status(200).json({ result: false, message: 'Contraseña Actual Inválida' });
        }
      } else {
        res.status(200).json({ result: false, message: 'Usuario Inválido' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/users/:id', auth, (req, res) => {
    User(token(req.headers.authorization)).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Usuario Eliminado' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default userRoute;