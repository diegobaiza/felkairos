import Sequelize from 'sequelize';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

import Operation from '../models/operation.js';
import DetailOperation from '../models/detailOperation.js';
import PaymentOperation from '../models/paymentOperation.js';
import Customer from '../models/customer.js';
import Supplier from '../models/supplier.js';
import Document from '../models/document.js';
import TypeDocument from '../models/typeDocument.js';
import User from '../models/user.js';
import Branch from '../models/branch.js';
import Warehouse from '../models/warehouse.js';
import auth from '../middleware/auth.js';
import Product from '../models/product.js';
import Cost from '../models/cost.js';
import Kardex from '../models/kardex.js';
import Company from "../models/company.js";
import Mailer from '../middleware/mailer.js';
import Unit from '../models/unit.js';
import Recipe from '../models/recipe.js';

function operationRoute(app) {

  app.get('/operations', auth, (req, res) => {
    Operation(req).findAll({
      include: [
        { model: Customer(req) },
        { model: Supplier(req) },
        {
          model: Document(req), include: [
            { model: TypeDocument(req) }
          ]
        },
        {
          model: DetailOperation(req),
          include: [
            {
              model: Product(req),
              include: [
                { model: Unit(req) },
                { model: Unit(req), as: 'entryUnit' }
              ]
            }
          ]
        },
        {
          model: PaymentOperation(req)
        }
      ],
      order: [
        ['date', 'DESC'],
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/operations/range/:startDate/:endDate', auth, (req, res) => {
    const range = { [Sequelize.Op.between]: [req.params.startDate + ' 00:00', req.params.endDate + ' 23:59'] };
    Operation(req).findAll({
      where: { date: range },
      include: [
        { model: Customer(req) },
        { model: Supplier(req) },
        {
          model: Document(req), include: [
            { model: TypeDocument(req) }
          ]
        },
        {
          model: DetailOperation(req),
          include: [
            {
              model: Product(req),
              include: [
                { model: Unit(req) },
                { model: Unit(req), as: 'entryUnit' }
              ]
            }
          ]
        },
        {
          model: PaymentOperation(req)
        }
      ],
      order: [
        ['date', 'DESC'],
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/operations/type/:type', auth, (req, res) => {
    Operation(req).findAll({
      include: [
        { model: Customer(req) },
        { model: Supplier(req) },
        {
          model: Document(req), include: [
            { model: TypeDocument(req), required: true, where: { name: req.params.type } }
          ]
        },
        {
          model: DetailOperation(req),
          include: [
            {
              model: Product(req),
              include: [
                { model: Unit(req) },
                { model: Unit(req), as: 'entryUnit' }
              ]
            }
          ]
        },
        {
          model: PaymentOperation(req)
        }
      ],
      order: [
        ['date', 'DESC'],
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/operations/:id', auth, (req, res) => {
    Operation(req).findOne({
      where: { id: req.params.id },
      include: [
        { model: Customer(req) },
        { model: Supplier(req) },
        {
          model: Document(req), include: [
            { model: TypeDocument(req) }
          ]
        },
        { model: User(req) },
        { model: Branch(req) },
        { model: Warehouse(req) },
        {
          model: DetailOperation(req),
          include: [
            {
              model: Product(req),
              include: [
                { model: Unit(req) },
                { model: Unit(req), as: 'entryUnit' }
              ]
            }
          ]
        },
        {
          model: PaymentOperation(req)
        },
        {
          model: Operation(req),
          required: false,
          as: 'notes',
          where: { status: 'CERTIFICADA' },
          include: [
            {
              model: Document(req),
              include: [
                { model: TypeDocument(req) }
              ]
            },
          ]
        },
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/operations/serieFel/:serieFel', auth, (req, res) => {
    Operation(req).findAll({
      where: { serieFel: req.params.serieFel },
      include: [
        { model: Customer(req) },
        { model: Supplier(req) },
        {
          model: Document(req), include: [
            { model: TypeDocument(req) }
          ]
        },
        { model: User(req) },
        { model: Branch(req) },
        { model: Warehouse(req) },
        {
          model: DetailOperation(req),
          include: [
            {
              model: Product(req),
              include: [
                { model: Unit(req) },
                { model: Unit(req), as: 'entryUnit' }
              ]
            }
          ]
        },
        {
          model: PaymentOperation(req)
        },
        {
          model: Operation(req),
          required: false,
          as: 'notes',
          where: { status: 'CERTIFICADA' },
          include: [
            {
              model: Document(req),
              include: [
                { model: TypeDocument(req) }
              ]
            },
          ]
        },
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/operations/numberFel/:numberFel', auth, (req, res) => {
    Operation(req).findAll({
      where: { numberFel: req.params.numberFel },
      include: [
        { model: Customer(req) },
        { model: Supplier(req) },
        {
          model: Document(req), include: [
            { model: TypeDocument(req) }
          ]
        },
        { model: User(req) },
        { model: Branch(req) },
        { model: Warehouse(req) },
        {
          model: DetailOperation(req),
          include: [
            {
              model: Product(req),
              include: [
                { model: Unit(req) },
                { model: Unit(req), as: 'entryUnit' }
              ]
            }
          ]
        },
        {
          model: PaymentOperation(req)
        },
        {
          model: Operation(req),
          required: false,
          as: 'notes',
          where: { status: 'CERTIFICADA' },
          include: [
            {
              model: Document(req),
              include: [
                { model: TypeDocument(req) }
              ]
            },
          ]
        },
      ]
    }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/operations', auth, async (req, res) => {
    let document = await Document(req).findOne({
      where: { id: req.body.documentId }, include: [
        { model: TypeDocument(req) }
      ]
    });
    if (document) {
      req.body.serie = document.serie;
      req.body.correlative = document.correlative;
      let operation = await Operation(req).findOne({ where: { serie: req.body.serie, correlative: req.body.correlative, documentId: document.id } });
      if (operation) {
        res.status(200).json({ result: false, message: 'Serie y Correlativo Existentes' });
      } else {
        let data = await Operation(req).create(req.body).catch(err => {
          res.status(200).json({ result: false, message: err });
        });

        if (data) {
          data.id = data.null;
          await Document(req).update({ correlative: increase(document.correlative) }, { where: { id: req.body.documentId } });

          let details = [];
          let details2 = [];
          req.body.details ? details = req.body.details : [];

          for (let i = 0; i < details.length; i++) {

            if (document.typedocument.inventory == 'ENTRADA') {
              let exist = false;
              for (let d = 0; d < details2.length; d++) {
                if (details[i].productId == details2[d].productId) {
                  exist = true;
                  break;
                }
              }
              if (!exist) {
                details2.push(details[i]);
              }
            }

            let subtotal = 0;
            if (document.typedocument.inventory == 'ENTRADA') {
              subtotal = Math.round((((details[i].quantity * details[i].cost) - details[i].discount) + Number.EPSILON) * 100) / 100;
            }
            if (document.typedocument.inventory == 'SALIDA') {
              subtotal = Math.round((((details[i].quantity * details[i].price) - details[i].discount) + Number.EPSILON) * 100) / 100;
            }
            const params = {
              quantity: details[i].quantity,
              cost: details[i].cost,
              price: details[i].price,
              discount: details[i].discount,
              description: details[i].description,
              subtotal: subtotal,
              productId: details[i].productId,
              operationId: data.id,
            };
            await DetailOperation(req).create(params);

            let prod = await Product(req).findOne({ where: { id: details[i].productId } });

            if (prod && prod.type == 'BIEN') {
              let type = '';
              let stock = 0;
              let quantity = 0;
              if (document.typedocument.inventory == 'ENTRADA') {
                type = 'Entrada';
                if (prod.equivalence != 1) {
                  quantity = details[i].quantity * prod.equivalence;
                  stock = details[i].stock + quantity;
                } else {
                  quantity = details[i].quantity;
                  stock = details[i].stock + details[i].quantity;
                }
              } else {
                type = 'Salida';
                quantity = details[i].quantity;
                stock = details[i].stock - details[i].quantity;
              }

              const params2 = {
                date: req.body.date,
                type: type,
                quantity: quantity,
                stock: stock,
                cost: details[i].cost,
                price: details[i].price,
                costProm: 0,
                productId: details[i].productId,
                variationId: details[i].variationId,
                branchId: req.body.branchId,
                warehouseId: req.body.warehouseId,
                operationId: data.id,
              }
              await Kardex(req).create(params2);

              if (document.typedocument.name == 'TRASLADO') {
                stock = 0;
                let where = {
                  productId: details[i].productId,
                  branchId: req.body.branch_end.id,
                  warehouseId: req.body.warehouse_end.id
                }
                if (!details[i].productId) {
                  where.productId = { [Sequelize.Op.ne]: null };
                }
                if (!req.body.branch_end.id) {
                  where.branchId = { [Sequelize.Op.ne]: null };
                }
                if (!req.body.warehouse_end.id) {
                  delete where.warehouseId
                }
                let kardex = await Kardex(req).findOne({
                  where: where,
                  order: [["id", "DESC"]]
                });
                if (kardex) {
                  stock = parseFloat(kardex.stock) + parseFloat(details[i].quantity);
                } else {
                  stock = 0 + details[i].quantity;
                }

                const params3 = {
                  date: req.body.date,
                  type: 'Entrada',
                  quantity: details[i].quantity,
                  stock: stock,
                  productId: details[i].productId,
                  variationId: details[i].variationId,
                  branchId: req.body.branch_end.id,
                  warehouseId: req.body.warehouse_end.id,
                  operationId: data.id,
                }
                await Kardex(req).create(params3);
              }
              if (req.body.auto_date == false) {
                let where = {
                  productId: details[i].productId,
                  branchId: req.body.branchId,
                  warehouseId: req.body.warehouseId,
                  date: { [Sequelize.Op.gte]: req.body.date }
                }
                if (!details[i].productId) {
                  where.productId = { [Sequelize.Op.ne]: null };
                }
                if (!req.body.branchId) {
                  where.branchId = { [Sequelize.Op.ne]: null };
                }
                if (!req.body.warehouseId) {
                  delete where.warehouseId
                  // where.warehouseId = { [Sequelize.Op.ne]: null };
                }
                let kardex = await Kardex(req).findAll({
                  where: where,
                  include: [
                    {
                      model: Operation(req), required: false
                    }
                  ],
                  order: [[Operation(req), "date", "ASC"]]
                });
                for (let k = 0; k < kardex.length; k++) {
                  if (k == kardex.length - 1) {
                    if (kardex[k].type == 'Entrada') {
                      stock = stock + kardex[k].quantity;
                    }
                    if (kardex[k].type == 'Salida') {
                      stock = stock - kardex[k].quantity;
                    }
                  } else {
                    if (kardex[k + 1].type == 'Entrada') {
                      stock = parseFloat(kardex[k + 1].stock) - parseFloat(kardex[k + 1].quantity);
                    }
                    if (kardex[k + 1].type == 'Salida') {
                      stock = parseFloat(kardex[k + 1].stock) + parseFloat(kardex[k + 1].quantity);
                    }
                    if (type == 'Entrada') {
                      stock = stock + parseFloat(quantity);
                    }
                    if (type == 'Salida') {
                      stock = stock - parseFloat(quantity);
                    }
                  }
                  await Kardex(req).update(
                    { stock: stock },
                    { where: { id: kardex[k].id } }
                  );
                }
              }
            }

            if (prod && prod.type == 'COMBO') {
              let recipes = await Recipe(req).findAll({ where: { productId: details[i].productId } });
              for (let r = 0; r < recipes.length; r++) {
                let stock = 0;
                let where = {
                  productId: recipes[r].productRecipeId,
                  branchId: req.body.branchId,
                  warehouseId: req.body.warehouseId
                }
                if (!recipes[r].productRecipeId) {
                  where.productId = { [Sequelize.Op.ne]: null };
                }
                if (!req.body.branchId) {
                  where.branchId = { [Sequelize.Op.ne]: null };
                }
                if (!req.body.warehouseId) {
                  delete where.warehouseId
                }
                let kardex = await Kardex(req).findOne({
                  where: where,
                  order: [["id", "DESC"]]
                });
                if (kardex) {
                  stock = parseFloat(kardex.stock) - (parseFloat(details[i].quantity) * parseFloat(recipes[r].quantity));
                } else {
                  stock = 0 - (parseFloat(details[i].quantity) * parseFloat(recipes[r].quantity));
                }
                const params2 = {
                  date: req.body.date,
                  type: 'Salida',
                  quantity: parseFloat(details[i].quantity) * parseFloat(recipes[r].quantity),
                  stock: stock,
                  // cost: details[i].cost,
                  // price: details[i].price,
                  // costProm: costProm,
                  productId: recipes[r].productRecipeId,
                  variationId: recipes[r].variationId,
                  branchId: req.body.branchId,
                  warehouseId: req.body.warehouseId,
                  operationId: data.id,
                }
                await Kardex(req).create(params2);
              }
            }

          }

          let methods = [];
          req.body.methods ? methods = req.body.methods : [];
          for (let i = 0; i < methods.length; i++) {
            const params = {
              type: methods[i].type,
              auth: methods[i].auth,
              total: methods[i].total,
              operationId: data.id,
            };
            await PaymentOperation(req).create(params);
          }

          if (document.typedocument.inventory == 'SALIDA') {
            if (data.customerId) {
              await Customer(req).update({ email: req.body.customer.email }, { where: { id: data.customerId } });
            }
            if (data.supplierId) {
              await Supplier(req).update({ email: req.body.supplier.email }, { where: { id: data.supplierId } });
            }
          }

          // Costo Promedio Producto
          if (document.typedocument.inventory == 'ENTRADA') {
            let branches = await Branch(req).findAll({ attributes: ['id', 'name'] });
            let warehouses = await Warehouse(req).findAll({ attributes: ['id', 'name'] });

            for (let i = 0; i < details2.length; i++) {
              let total_stock = 0;
              let total_quantity = 0;

              if (details2[i].product.variations.length > 0) {
                for (let b = 0; b < branches.length; b++) {
                  for (let w = 0; w < warehouses.length; w++) {
                    for (let v = 0; v < details2[i].product.variations.length; v++) {
                      let where = {
                        productId: details2[i].productId,
                        branchId: branches[b].id,
                        warehouseId: warehouses[w].id,
                        variationId: details2[i].product.variations[v].id,
                      }
                      if (!details2[i].productId) {
                        where.productId = { [Sequelize.Op.ne]: null };
                      }
                      if (!req.body.branchId) {
                        where.branchId = { [Sequelize.Op.ne]: null };
                      }
                      if (!req.body.warehouseId) {
                        delete where.warehouseId
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
                        total_quantity = total_quantity + parseFloat(stock.quantity);
                        total_stock = total_stock + parseFloat(stock.stock);
                      }

                      // await Kardex(req).update(
                      //   { costProm: costProm / stock },
                      //   { where: { id: kardex.id } }
                      // );
                    }
                  }
                }
                details2[i].product.total_quantity = total_quantity;
                details2[i].product.total_stock = total_stock;

                let cost_prom = ((total_stock - total_quantity) * (details2[i].product.cost)) + (total_quantity * ((details2[i].cost / details2[i].product.equivalence) / 1.12));
                cost_prom = cost_prom / total_stock;

                await Product(req).update(
                  { cost: cost_prom },
                  { where: { id: details2[i].productId } }
                );
                await Cost(req).create({
                  date: moment().format('YYYY-MM-DD HH:mm:ss'),
                  cost: cost_prom,
                  price: details2[i].product.price,
                  productId: details2[i].productId,
                  operationId: data.id
                });

              } else {
                for (let b = 0; b < branches.length; b++) {
                  for (let w = 0; w < warehouses.length; w++) {
                    let where = {
                      productId: details2[i].productId,
                      branchId: branches[b].id,
                      warehouseId: warehouses[w].id,
                      date: { [Sequelize.Op.lte]: moment().format('YYYY-MM-DD HH:mm:ss') }
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
                      total_quantity = total_quantity + parseFloat(stock.quantity);
                      total_stock = total_stock + parseFloat(stock.stock);
                    }
                  }
                }
                details2[i].product.total_quantity = total_quantity;
                details2[i].product.total_stock = total_stock;

                let cost_prom = ((total_stock - total_quantity) * (details2[i].product.cost)) + (total_quantity * ((details2[i].cost / details2[i].product.equivalence) / 1.12));
                cost_prom = cost_prom / total_stock;

                await Product(req).update(
                  { cost: cost_prom },
                  { where: { id: details2[i].productId } }
                );
                await Cost(req).create({
                  date: moment().format('YYYY-MM-DD HH:mm:ss'),
                  cost: cost_prom,
                  price: details2[i].product.price,
                  productId: details2[i].productId,
                  operationId: data.id
                });
              }

            }
          }

          res.status(200).json({ result: true, message: 'Operacion Agregada', data: data });
        }
      }
    } else {
      res.status(200).json({ result: false, message: 'Documento no encontrado' });
    }
  });

  app.post('/operations/email/:id', auth, (req, res) => {
    Operation(req).findOne({
      where: { id: req.params.id },
      include: [
        { model: Customer(req) },
        { model: Supplier(req) },
        {
          model: Document(req), include: [
            { model: TypeDocument(req) }
          ]
        },
        { model: User(req) },
        { model: Branch(req) },
        { model: Warehouse(req) },
        {
          model: DetailOperation(req),
          include: [
            {
              model: Product(req),
              include: [
                { model: Unit(req) },
                { model: Unit(req), as: 'entryUnit' }
              ]
            }
          ]
        },
        {
          model: PaymentOperation(req)
        },
        {
          model: Operation(req),
          required: false,
          as: 'notes',
          where: { status: 'CERTIFICADA' },
          include: [
            {
              model: Document(req),
              include: [
                { model: TypeDocument(req) }
              ]
            },
          ]
        },
      ]
    }).then(async data => {
      let company = await Company.findOne({ where: { database: req } });

      const pdfData = {
        image: `${req.protocol}://${req.get('host')}${company.image}`,
        serie: data.serie,
        correlative: data.correlative,
        date: moment(data.date).subtract(6, 'hour').format('DD-MM-YYYY HH:mm'),
        type: data.document.typedocument.name,
        svg: `${req.protocol}://${req.get('host')}${data.document.image}`,
        invoice: `${req.protocol}://${req.get('host')}/${company.database}/invoice/${data.id}`,
        color: data.document.primaryColor,
        status: data.status,
        observations: data.observations,
        currency: data.currency,
        // customer: customerData,
        // supplier: supplierData,
        // branch: branchData,
        // warehouse: warehouseData,
        // details: details,
        total: data.total,
        subtotal: data.subtotal,
        iva: data.iva,
        discount: data.discount,
        company: {
          name: company.name,
          nit: company.nit,
        },
        autorizacionFel: data.autorizacionFel,
        serieFel: data.serieFel,
        numberFel: data.numberFel
      }

      let email = data.customer ? data.customer.email : data.supplier.email;

      var templateHtml = fs.readFileSync(path.join(process.cwd(), `./src/templates/operation.html`), 'utf8');
      var template = handlebars.compile(templateHtml);
      var html = template(pdfData);

      const message = {
        from: `"${company.name}" <support@creativodigital.com.gt>`,
        to: [email],
        subject: `${data.document.typedocument.name} ${data.serie}-${data.correlative}`,
        html: html,
        attachments: [
          {
            filename: `${data.document.typedocument.name} ${data.serie}-${data.correlative}.pdf`,
            path: `${req.protocol}://${req.get('host')}/${company.database}/invoice/${req.params.id}`
          },
        ]
      };
      Mailer.sendMail(message, function (err, info) {
        if (err) {
          res.status(200).json({ result: false, message: err });
        } else {
          res.status(200).json(info);
        }
      });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.put('/operations/:id', auth, (req, res) => {
    Operation(req).update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Operacion Actualizada' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/operations/:id', auth, (req, res) => {
    Operation(req).destroy({ where: { id: req.params.id } }).then(data => {
      if (data == 1) {
        res.status(200).json({ result: true, message: 'Operacion Eliminada' });
      } else {
        res.status(200).json({ result: false, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  function increase(correlative) {
    let res = '';
    let oldC = correlative;
    let newC = parseInt(correlative) + 1;
    for (let i = 0; i < (oldC.length - newC.toString().length); i++) {
      res += '0';
    }
    res += newC.toString();
    return res;
  }

} export default operationRoute;