import Supplier from "../models/supplier.js";
import auth from '../middleware/auth.js';
import token from '../middleware/token.js';
import Operation from "../models/operation.js";
import Document from "../models/document.js";
import TypeDocument from "../models/typeDocument.js";

function supplierRoute(app) {

  app.get('/suppliers', auth, (req, res) => {
    Supplier(token(req.headers.authorization)).findAll().then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/suppliers/:id', auth, (req, res) => {
    Supplier(token(req.headers.authorization)).findOne({ where: { id: req.params.id } }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/suppliers/cxp/:id', auth, (req, res) => {
    Operation(token(req.headers.authorization)).findAll({
      where: {
        supplierId: req.params.id,
        payment: 'CREDITO'
      },
      include: [
        {
          model: Document(token(req.headers.authorization)),
          include: [
            { model: TypeDocument(token(req.headers.authorization)) }
          ]
        },
        {
          model: Operation(token(req.headers.authorization)),
          include: [
            {
              model: Document(token(req.headers.authorization)),
              include: [
                { model: TypeDocument(token(req.headers.authorization)) }
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

  app.post('/suppliers', auth, (req, res) => {
    Supplier(token(req.headers.authorization)).findOne({ where: { nit: req.body.nit } }).then(data => {
      if (data) {
        res.status(200).json({ result: false, message: 'NIT ya registrado' });
      } else {
        Supplier(token(req.headers.authorization)).create(req.body).then(data => {
          data.id = data.null;
          res.status(200).json({ result: true, message: 'Proveedor Agregado', data: data });
        }).catch(err => {
          res.status(200).json({ result: false, message: err });
        });
      }
    });
  });

  app.put('/suppliers/:id', auth, (req, res) => {
    Supplier(token(req.headers.authorization)).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Proveedor Actualizado' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/suppliers/:id', auth, (req, res) => {
    Supplier(token(req.headers.authorization)).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Proveedor Eliminado' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default supplierRoute;