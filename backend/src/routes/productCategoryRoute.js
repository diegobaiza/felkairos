import auth from '../middleware/auth.js';
import ProductCategory from '../models/productCategory.js';
// import token from '../middleware/token.js';

function productCategoryRoute(app) {

  app.get('/productsCategories', auth, (req, res) => {
    ProductCategory(req).findAll().then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/productsCategories/:id', auth, (req, res) => {
    ProductCategory(req).findOne({
      where: { id: req.params.id }
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/productsCategories', auth, (req, res) => {
    ProductCategory(req).findOne({ where: { name: req.body.name } }).then(data => {
      if (data) {
        res.status(200).json({ result: false, message: 'Categoría del Producto ya registrado' });
      } else {
        ProductCategory(req).create(req.body).then(data => {
          data.id = data.null;
          res.status(200).json({ result: true, message: 'Categoría del Producto Agregada', data: data });
        }).catch(err => {
          res.status(200).json({ result: false, message: err });
        });
      }
    });
  });

  app.put('/productsCategories/:id', auth, (req, res) => {
    ProductCategory(req).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Categoría del Producto Actualizado' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/productsCategories/:id', auth, (req, res) => {
    ProductCategory(req).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Categoría del Producto Eliminado' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default productCategoryRoute;