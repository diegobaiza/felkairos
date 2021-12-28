import auth from '../middleware/auth.js';
import Variation from "../models/variation.js";
import Attribute from "../models/attribute.js";

function variationRoute(app) {

  app.get('/variations', auth, (req, res) => {
    Variation(req).findAll({
      include: [
        { model: Attribute(req) }
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/variations/:productId', auth, (req, res) => {
    Variation(req).findAll({
      where: {
        productId: req.params.productId
      },
      include: [
        { model: Attribute(req) }
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/variations', auth, (req, res) => {
    Variation(req).create(req.body).then(data => {
      data.id = data.null;
      res.status(200).json({ result: true, message: 'Variacion Agregada', data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.put('/variations/:id', auth, (req, res) => {
    Variation(req).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Variacion Actualizada' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/variations/:id', auth, (req, res) => {
    Variation(req).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Variacion Eliminada' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default variationRoute;