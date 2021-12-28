import Coupon from "../models/coupon.js";
import auth from '../middleware/auth.js';

function couponRoute(app) {

  app.get('/coupons', auth, (req, res) => {
    Coupon(req).findAll().then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/coupons/:id', auth, (req, res) => {
    Coupon(req).findOne({ where: { id: req.params.id } }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/coupons', auth, (req, res) => {
    Coupon(req).findOne({ where: { code: req.body.code } }).then(data => {
      if (data) {
        res.status(200).json({ result: false, message: 'Cupón ya registrado' });
      } else {
        Coupon(req).create(req.body).then(data => {
          data.id = data.null;
          res.status(200).json({ result: true, message: 'Cupón Agregado', data: data });
        }).catch(err => {
          res.status(200).json({ result: false, message: err });
        });
      }
    });
  });

  app.put('/coupons/:id', auth, (req, res) => {
    Coupon(req).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Cupón Actualizado' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/coupons/:id', auth, (req, res) => {
    Coupon(req).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Cupón Eliminado' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default couponRoute;