import Attribute from "../models/attribute.js";
import auth from '../middleware/auth.js';
import token from '../middleware/token.js';

function attributeRoute(app) {

  app.get('/attributes', auth, (req, res) => {
    Attribute(token(req.headers.authorization)).findAll().then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/attributes/:id', auth, (req, res) => {
    Attribute(token(req.headers.authorization)).findOne({ where: { id: req.params.id } }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/attributes', auth, (req, res) => {
    Attribute(token(req.headers.authorization)).findOne({ where: { symbol: req.body.symbol } }).then(data => {
      if (data) {
        res.status(200).json({ result: false, message: 'Atributo ya registrado' });
      } else {
        Attribute(token(req.headers.authorization)).create(req.body).then(data => {
          data.id = data.null;
          res.status(200).json({ result: true, message: 'Atributo Agregado', data: data });
        }).catch(err => {
          res.status(200).json({ result: false, message: err });
        });
      }
    });
  });

  app.put('/attributes/:id', auth, (req, res) => {
    Attribute(token(req.headers.authorization)).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Atributo Actualizado' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/attributes/:id', auth, (req, res) => {
    Attribute(token(req.headers.authorization)).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Atributo Eliminado' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default attributeRoute;