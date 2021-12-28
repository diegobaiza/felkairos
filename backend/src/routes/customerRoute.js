import Customer from "../models/customer.js";
import auth from '../middleware/auth.js';
import Sequelize from 'sequelize';
import Operation from "../models/operation.js";
import Document from "../models/document.js";
import TypeDocument from "../models/typeDocument.js";

function customerRoute(app) {

  app.get('/customers', auth, (req, res) => {
    Customer(req).findAll().then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/customers/:id', auth, (req, res) => {
    Customer(req).findOne({ where: { id: req.params.id } }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/customers/cxc/:startDate/:endDate/:id', auth, (req, res) => {
    const range = { [Sequelize.Op.between]: [req.params.startDate + ' 00:00', req.params.endDate + ' 23:59'] };
    Operation(req).findAll({
      where: {
        customerId: req.params.id,
        payment: 'CREDITO',
        date: range
      },
      include: [
        {
          model: Document(req),
          include: [
            { model: TypeDocument(req) }
          ]
        },
        {
          model: Operation(req),
          include: [
            {
              model: Document(req),
              include: [
                { model: TypeDocument(req) }
              ]
            }
          ]
        }
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/customers', auth, (req, res) => {
    Customer(req).findOne({ where: { nit: req.body.nit } }).then(data => {
      if (data) {
        res.status(200).json({ result: false, message: 'NIT ya registrado' });
      } else {
        Customer(req).create(req.body).then(data => {
          data.id = data.null;
          res.status(200).json({ result: true, message: 'Cliente Agregado', data: data });
        }).catch(err => {
          res.status(200).json({ result: false, message: err });
        });
      }
    });
  });

  app.put('/customers/:id', auth, (req, res) => {
    Customer(req).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Cliente Actualizado' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/customers/:id', auth, (req, res) => {
    Customer(req).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Cliente Eliminado' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default customerRoute;