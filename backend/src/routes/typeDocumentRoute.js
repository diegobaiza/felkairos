import auth from '../middleware/auth.js';
import TypeDocument from "../models/typeDocument.js";

function typeDocumentRoute(app) {

  app.get('/typeDocuments', auth, (req, res) => {
    TypeDocument(req).findAll().then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/typeDocuments/:id', auth, (req, res) => {
    TypeDocument(req).findOne({ where: { id: req.params.id } }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/typeDocuments', auth, (req, res) => {
    TypeDocument(req).create(req.body).then(data => {
      data.id = data.null;
      res.status(200).json({ result: true, message: 'Tipo de Documento Agregado', data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.put('/typeDocuments/:id', auth, (req, res) => {
    TypeDocument(req).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Tipo de Documento Actualizado' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/typeDocuments/:id', auth, (req, res) => {
    TypeDocument(req).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Tipo de Documento Eliminado' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default typeDocumentRoute;