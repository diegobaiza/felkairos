import Unit from "../models/unit.js";
import auth from '../middleware/auth.js';
import token from '../middleware/token.js';

function unitRoute(app) {

  app.get('/units', auth, (req, res) => {
    Unit(token(req.headers.authorization)).findAll().then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/units/:id', auth, (req, res) => {
    Unit(token(req.headers.authorization)).findOne({ where: { id: req.params.id } }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/units', auth, (req, res) => {
    Unit(token(req.headers.authorization)).findOne({ where: { symbol: req.body.symbol } }).then(data => {
      if (data) {
        res.status(200).json({ result: false, message: 'Medida ya registrada' });
      } else {
        Unit(token(req.headers.authorization)).create(req.body).then(data => {
          data.id = data.null;
          res.status(200).json({ result: true, message: 'Medida Agregada', data: data });
        }).catch(err => {
          res.status(200).json({ result: false, message: err });
        });
      }
    });
  });

  app.put('/units/:id', auth, (req, res) => {
    Unit(token(req.headers.authorization)).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Medida Actualizada' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/units/:id', auth, (req, res) => {
    Unit(token(req.headers.authorization)).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Medida Eliminada' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default unitRoute;