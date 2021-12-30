import DetailOperation from '../models/detailOperation.js';
import Product from '../models/product.js';
import auth from '../middleware/auth.js';

function detailOperationRoute(app) {

  app.get('/detailOperations', auth, (req, res) => {
    DetailOperation(req).findAll({
      include: [
        { model: Product(req) }
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/detailOperations/:id', auth, (req, res) => {
    DetailOperation(req).findOne({
      where: { id: req.params.id },
      include: [
        { model: Product(req) }
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/detailOperations', auth, (req, res) => {
    DetailOperation(req).create(req.body).then(data => {
      data.id = data.null;
      res.status(200).json({ result: true, message: 'Detalle de Operacion Agregado', data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.put('/detailOperations/:id', auth, (req, res) => {
    DetailOperation(req).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Detalle de Operacion Actualizado' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/detailOperations/:id', auth, (req, res) => {
    DetailOperation(req).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Detalle de Operacion Eliminado' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default detailOperationRoute;