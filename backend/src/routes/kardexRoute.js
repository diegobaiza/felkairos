import Sequelize from 'sequelize';
import auth from '../middleware/auth.js';
import moment from 'moment';
import Kardex from '../models/kardex.js';
import Operation from '../models/operation.js';
import Product from '../models/product.js';
import Branch from '../models/branch.js';
import Warehouse from '../models/warehouse.js';
import Document from '../models/document.js';
import TypeDocument from '../models/typeDocument.js';
import Unit from '../models/unit.js';
import Variation from '../models/variation.js';
import Attribute from '../models/attribute.js';
import Cost from '../models/cost.js';

function kardexRoute(app) {

  app.get('/kardex/stocks/:date/:branch/:warehouse/:product/:variation', auth, async (req, res) => {
    let branches = [];
    let warehouses = [];
    let products = [];
    if (req.params.product == 'null') {
      products = await Product(req).findAll({
        include: [
          { model: Unit(req) },
          { model: Unit(req), as: 'entryUnit' }
        ]
      });
    } else {
      products[0] = await Product(req).findOne({
        where: { id: parseInt(req.params.product) },
        include: [
          { model: Unit(req) },
          { model: Unit(req), as: 'entryUnit' }
        ]
      });
    }
    if (req.params.branch == 'null') {
      branches = await Branch(req).findAll({ attributes: ['id', 'name'] });
    } else {
      branches[0] = await Branch(req).findOne({ where: { id: req.params.branch }, attributes: ['id', 'name'] });
    }

    if (req.params.warehouse == 'null') {
      warehouses = await Warehouse(req).findAll({ attributes: ['id', 'name'] });
    } else {
      warehouses[0] = await Warehouse(req).findOne({ where: { id: req.params.warehouse }, attributes: ['id', 'name'] });
    }

    let stocks = [];
    let total_stock = 0;
    let total_branches = 0;
    let total_warehouses = 0;
    let total_products = 0;

    total_products = products.length;
    total_branches = total_branches + branches.length;
    for (let b = 0; b < branches.length; b++) {
      stocks.push({
        branch: branches[b],
        warehouses: []
      });
      total_warehouses = total_warehouses + warehouses.length;
      for (let w = 0; w < warehouses.length; w++) {
        stocks[b].warehouses.push({
          warehouse: warehouses[w],
          products: []
        })
        for (let p = 0; p < products.length; p++) {
          let costProm = await Cost(req).findOne({
            where: {
              productId: products[p].id,
              date: { [Sequelize.Op.lte]: moment(req.params.date).format('YYYY-MM-DD HH:mm:ss') }
            },
            order: [
              ["date", "DESC"]
            ]
          });
          stocks[b].warehouses[w].products.push({
            product: products[p],
            costProm: costProm ? costProm : { cost: 0 },
            data: []
          });
          let variations = await Variation(req).findAll({
            where: { productId: products[p].id },
            include: [
              {
                model: Attribute(req), required: false,
              }
            ]
          });
          if (variations.length == 0) {
            let where = {
              productId: products[p].id,
              branchId: branches[b].id,
              warehouseId: warehouses[w].id,
              date: { [Sequelize.Op.lte]: moment(req.params.date).format('YYYY-MM-DD HH:mm:ss') }
            }
            let stock = await Kardex(req).findOne({
              where: where,
              include: [
                {
                  model: Operation(req), attributes: ['date'], required: false,
                }
              ],
              order: [[Operation(req), "date", "DESC"]]
            });
            if (stock) {
              total_stock = total_stock + parseFloat(stock.stock);
              stocks[b].warehouses[w].products[p].data.push(stock);
            } else {
              stocks[b].warehouses[w].products[p].data.push({
                stock: 0
              });
            }
          } else {
            if (req.params.variation == 'null') {
              for (let v = 0; v < variations.length; v++) {
                let where = {
                  productId: products[p].id,
                  branchId: branches[b].id,
                  warehouseId: warehouses[w].id,
                  variationId: variations[v].id,
                  date: { [Sequelize.Op.lte]: moment(req.params.date).format('YYYY-MM-DD HH:mm:ss') }
                }
                let stock = await Kardex(req).findOne({
                  where: where,
                  include: [
                    {
                      model: Operation(req), attributes: ['date'], required: false,
                    },
                    {
                      model: Variation(req), required: false,
                      include: [
                        { model: Attribute(req) }
                      ]
                    }
                  ],
                  order: [[Operation(req), "date", "DESC"]]
                });
                if (stock) {
                  total_stock = total_stock + parseFloat(stock.stock);
                  stocks[b].warehouses[w].products[p].data.push(stock);
                } else {
                  stocks[b].warehouses[w].products[p].data.push({
                    stock: 0,
                    variationId: variations[v].id,
                    variation: variations[v]
                  });
                }
              }
            } else {
              let where = {
                productId: products[p].id,
                branchId: branches[b].id,
                warehouseId: warehouses[w].id,
                variationId: req.params.variation,
                date: { [Sequelize.Op.lte]: moment(req.params.date).format('YYYY-MM-DD HH:mm:ss') }
              }
              let stock = await Kardex(req).findOne({
                where: where,
                include: [
                  {
                    model: Operation(req), attributes: ['date'], required: false,
                  },
                  {
                    model: Variation(req), required: false,
                    include: [
                      { model: Attribute(req) }
                    ]
                  }
                ],
                order: [[Operation(req), "date", "DESC"]]
              });
              if (stock) {
                total_stock = total_stock + parseFloat(stock.stock);
                stocks[b].warehouses[w].products[p].data.push(stock);
              } else {
                stocks[b].warehouses[w].products[p].data.push({
                  stock: 0,
                  variationId: req.params.variation,
                  variation: await Variation(req).findOne({
                    where: { id: req.params.variation }, include: [
                      { model: Attribute(req) }
                    ]
                  })
                });
              }
            }
          }
        }
      }
    }

    res.status(200).json({
      total_stock: total_stock,
      total_branches: total_branches,
      total_warehouses: total_warehouses,
      total_products: total_products,
      stocks: stocks
    });
  });

  app.get('/kardex/:startDate/:endDate/:branch/:warehouse/:product/:variation', auth, (req, res) => {
    let range = { [Sequelize.Op.between]: [req.params.startDate + ' 00:00', req.params.endDate + ' 23:59'] };
    let where = {
      productId: req.params.product,
      variationId: req.params.variation,
      branchId: req.params.branch,
      warehouseId: req.params.warehouse,
      date: range
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
      // where.warehouseId = { [Sequelize.Op.ne]: null };
    }
    Kardex(req).findAll({
      where: where,
      include: [
        {
          model: Product(req), required: false,
          include: [
            { model: Unit(req) },
            { model: Unit(req), as: 'entryUnit' }
          ]
        },
        { model: Branch(req), required: false },
        { model: Warehouse(req), required: false },
        {
          model: Operation(req), required: false,
          include: [
            {
              model: Document(req),
              include: [
                { model: TypeDocument(req) }
              ]
            }
          ]
        },
        {
          model: Variation(req), required: false,
          include: [
            { model: Attribute(req) }
          ]
        }
      ],
      order: [[Operation(req), "date", "DESC"]]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/kardex', auth, (req, res) => {
    Kardex(req).create(req.body).then(data => {
      data.id = data.null;
      res.status(200).json({ result: true, message: 'Kardex Agregado', data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.put('/kardex/:id', auth, (req, res) => {
    Kardex(req).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Kardex Actualizado' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/kardex/:id', auth, (req, res) => {
    Kardex(req).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Kardex Eliminado' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

} export default kardexRoute;