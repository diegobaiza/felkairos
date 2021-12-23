import auth from '../middleware/auth.js';
import token from '../middleware/token.js';
import User from "../models/user.js";
import Role from "../models/role.js";

function roleRoute(app) {

  app.get('/roles', auth, (req, res) => {
    Role(token(req.headers.authorization)).findAll({
      include:
        [
          { model: User(token(req.headers.authorization)) }
        ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      // console.log('Hola');
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/roles/:id', auth, (req, res) => {
    Role(token(req.headers.authorization)).findOne({
      where: { id: req.params.id }
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/roles', auth, (req, res) => {
    Role(token(req.headers.authorization)).findOne({ where: { symbol: req.body.symbol } }).then(data => {
      if (data) {
        res.status(200).json({ result: false, message: 'Rol ya registrado' });
      } else {
        Role(token(req.headers.authorization)).create(req.body).then(data => {
          data.id = data.null;
          res.status(200).json({ result: true, message: 'Rol Agregado', data: data });
        }).catch(err => {
          res.status(200).json({ result: false, message: err });
        });
      }
    });
  });

  app.put('/roles/:id', auth, (req, res) => {
    Role(token(req.headers.authorization)).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Rol Actualizado' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/roles/:id', auth, (req, res) => {
    Role(token(req.headers.authorization)).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Rol Eliminado' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default roleRoute;