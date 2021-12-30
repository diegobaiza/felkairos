import auth from '../middleware/auth.js';
import Recipe from "../models/recipe.js";

function recipeRoute(app) {

  app.get('/recipes', auth, (req, res) => {
    Recipe(req).findAll().then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/recipes/:productId', auth, (req, res) => {
    Recipe(req).findAll({
      where: {
        productId: req.params.productId
      }
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/recipes', auth, (req, res) => {
    Recipe(req).create(req.body).then(data => {
      data.id = data.null;
      res.status(200).json({ result: true, message: 'Receta Agregada', data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.put('/recipes/:id', auth, (req, res) => {
    Recipe(req).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Receta Actualizada' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/recipes/:id', auth, (req, res) => {
    Recipe(req).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Receta Eliminada' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default recipeRoute;