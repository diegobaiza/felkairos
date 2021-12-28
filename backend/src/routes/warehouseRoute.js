import auth from '../middleware/auth.js';
import Warehouse from "../models/warehouse.js";

function warehouseRoute(app) {

  app.get('/warehouses', auth, (req, res) => {
    Warehouse(req).findAll().then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/warehouses/:id', auth, (req, res) => {
    Warehouse(req).findOne({ where: { id: req.params.id } }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/warehouses/branch/:id', auth, (req, res) => {
    Warehouse(req).findAll({ where: { branchId: req.params.id } }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/warehouses', auth, (req, res) => {
    Warehouse(req).create(req.body).then(data => {
      data.id = data.null;
      res.status(200).json({ result: true, message: 'Sucursal Agregada', data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.put('/warehouses/:id', auth, (req, res) => {
    Warehouse(req).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Sucursal Actualizada' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/warehouses/:id', auth, (req, res) => {
    Warehouse(req).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Sucursal Eliminada' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default warehouseRoute;