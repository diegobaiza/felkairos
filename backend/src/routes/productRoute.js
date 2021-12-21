import Product from "../models/product.js";
import Kardex from '../models/kardex.js';
import auth from '../middleware/auth.js';
import token from '../middleware/token.js';
import Unit from "../models/unit.js";
import Recipe from "../models/recipe.js";
import Variation from "../models/variation.js";
import Attribute from "../models/attribute.js";
import fs from 'fs';

function productRoute(app) {

  let dirname = 'src/docs';

  app.get('/products', auth, (req, res) => {
    Product(token(req.headers.authorization)).findAll({
      include: [
        { model: Unit(token(req.headers.authorization)) },
        { model: Unit(token(req.headers.authorization)), as: 'entryUnit' },
        { model: Recipe(token(req.headers.authorization)) },
        {
          model: Variation(token(req.headers.authorization)),
          include: [
            { model: Attribute(token(req.headers.authorization)) }
          ]
        }
      ],
      order: [
        ['id', 'ASC']
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/products/:id', auth, (req, res) => {
    Product(token(req.headers.authorization)).findOne({
      where: {
        id: req.params.id
      },
      include: [
        { model: Unit(token(req.headers.authorization)) },
        { model: Unit(token(req.headers.authorization)), as: 'entryUnit' },
        { model: Recipe(token(req.headers.authorization)) },
        {
          model: Variation(token(req.headers.authorization)),
          include: [
            { model: Attribute(token(req.headers.authorization)) }
          ]
        }
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/products/stock/:branch/:warehouse/:product/:variation', auth, (req, res) => {
    let where = {
      branchId: req.params.branch,
      warehouseId: req.params.warehouse,
      productId: req.params.product,
      variationId: req.params.variation
    }
    if (req.params.product == 'null') {
      where.productId = { [Sequelize.Op.ne]: null };
    }
    if (req.params.variation == 'null') {
      delete where.variationId
    }
    if (req.params.branch == 'null') {
      where.branchId = { [Sequelize.Op.ne]: null };
    }
    if (req.params.warehouse == 'null') {
      delete where.warehouseId
    }
    Kardex(token(req.headers.authorization)).findOne({
      where: where,
      include: [
        {
          model: Product(token(req.headers.authorization)), required: false,
          include: [
            { model: Unit(token(req.headers.authorization)) },
            { model: Unit(token(req.headers.authorization)), as: 'entryUnit' }
          ]
        }
      ],
      order: [["date", "DESC"]]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/products', auth, (req, res) => {
    Product(token(req.headers.authorization)).create(req.body).then(async data => {
      data.id = data.null;
      if (req.body.recipes) {
        if (req.body.recipes.length > 0) {
          let recipes = req.body.recipes[r];
          for (let r = 0; r < recipes.length; r++) {
            await Recipe(token(req.headers.authorization)).create({
              quantity: recipes[r].quantity,
              productId: data.id,
              variationId: recipes[r].variationId,
              productRecipeId: recipes[r].productRecipeId
            });
          }
        }
      }
      if (req.body.variations) {
        if (req.body.variations.length > 0) {
          let variations = req.body.variations;
          for (let v = 0; v < variations.length; v++) {
            await Variation(token(req.headers.authorization)).create({
              productId: data.id,
              attributeId: variations[v].attributeId
            });
          }
        }
      }
      res.status(200).json({ result: true, message: 'Producto Agregado', data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.put('/products/:id', auth, (req, res) => {
    Product(token(req.headers.authorization)).update(req.body, { where: { id: req.params.id } }).then(async data => {
      if (req.body.recipes) {
        if (req.body.recipes.length > 0) {
          let recipes = req.body.recipes;
          for (let r = 0; r < recipes.length; r++) {
            let rec = await Recipe(token(req.headers.authorization)).findOne({
              where: {
                id: recipes[r].id
              }
            });
            if (rec) {
              await Recipe(token(req.headers.authorization)).update({
                quantity: recipes[r].quantity
              }, { where: { id: rec.id } });
            } else {
              await Recipe(token(req.headers.authorization)).create({
                quantity: recipes[r].quantity,
                productId: req.params.id,
                variationId: recipes[r].variationId,
                productRecipeId: recipes[r].productRecipeId
              });
            }
          }
        }
      }
      if (req.body.variations) {
        if (req.body.variations.length > 0) {
          let variations = req.body.variations;
          for (let v = 0; v < variations.length; v++) {
            if (variations[v].id == null) {
              await Variation(token(req.headers.authorization)).create({
                productId: req.params.id,
                attributeId: variations[v].attributeId
              });
            }
          }
        }
      }
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Producto Actualizado' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/products/:id', auth, (req, res) => {
    Product(token(req.headers.authorization)).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        let folder = `${dirname}/${token(req.headers.authorization)}/products/${req.params.id}`;
        if (fs.existsSync(folder)) {
          fs.rmSync(folder, { recursive: true });
        }
        res.status(200).json({ result: true, message: 'Producto Eliminado' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default productRoute;