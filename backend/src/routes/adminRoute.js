import Admin from "../models/admin.js";
import hash from 'password-hash';
import auth from '../middleware/auth.js';

function adminRoute(app) {

  app.get('/admin', auth, (req, res) => {
    Admin.findAll().then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/admin/:id', auth, (req, res) => {
    Admin.findOne({ where: { id: req.params.id } }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/admin', (req, res) => {
    req.body.password = hash.generate(req.body.password);
    Admin.findOne({ where: { username: req.body.username } }).then(data => {
      if (data) {
        res.status(200).json({ result: false, message: 'Usuario ya Existente' });
      } else {
        Admin.create(req.body).then(data => {
          data.id = data.null;
          res.status(200).json({ result: true, message: 'Usuario Agregado', data: data });
        }).catch(err => {
          res.status(200).json({ result: false, message: err });
        });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default adminRoute;