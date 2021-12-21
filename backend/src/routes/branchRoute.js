import Branch from "../models/branch.js";
import auth from '../middleware/auth.js';
import token from '../middleware/token.js';

function branchRoute(app) {

  app.get('/branches', auth, (req, res) => {
    Branch(token(req.headers.authorization)).findAll().then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/branches/:id', auth, (req, res) => {
    Branch(token(req.headers.authorization)).findOne({ where: { id: req.params.id } }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/branches', auth, (req, res) => {
    Branch(token(req.headers.authorization)).create(req.body).then(data => {
      data.id = data.null;
      res.status(200).json({ result: true, message: 'Sucursal Agregada', data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.put('/branches/:id', auth, (req, res) => {
    Branch(token(req.headers.authorization)).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Sucursal Actualizada' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/branches/:id', auth, (req, res) => {
    Branch(token(req.headers.authorization)).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Sucursal Eliminada' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default branchRoute;