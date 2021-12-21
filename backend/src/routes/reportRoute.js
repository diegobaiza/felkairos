import Operation from '../models/operation.js';
import DetailOperation from '../models/detailOperation.js';
import PaymentOperation from '../models/paymentOperation.js';
import Customer from '../models/customer.js';
import Supplier from '../models/supplier.js';
import Document from '../models/document.js';
import TypeDocument from '../models/typeDocument.js';
import User from '../models/user.js';
import Branch from '../models/branch.js';
import Product from '../models/product.js';
import moment from 'moment';
import Company from '../models/company.js';
import Sequelize from 'sequelize';
import Unit from '../models/unit.js';
import Warehouse from '../models/warehouse.js';
import Cost from '../models/cost.js';

import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import pdf from 'html-pdf';
import Variation from '../models/variation.js';
import Attribute from '../models/attribute.js';
import Kardex from '../models/kardex.js';

function reportRoute(app) {

  app.get('/:database/invoice/:id', async (req, res) => {
    let data = await Operation(req.params.database).findOne({
      where: { id: req.params.id },
      include: [
        { model: Customer(req.params.database) },
        { model: Supplier(req.params.database) },
        {
          model: Document(req.params.database), include: [
            { model: TypeDocument(req.params.database) }
          ]
        },
        { model: User(req.params.database) },
        { model: Branch(req.params.database) },
        { model: Warehouse(req.params.database) },
        {
          model: DetailOperation(req.params.database),
          include: [
            { model: Product(req.params.database) }
          ]
        },
        {
          model: PaymentOperation(req.params.database)
        },
        {
          model: Operation(req.params.database),
          required: false,
          as: 'notes',
          where: { status: 'CERTIFICADA' },
          include: [
            {
              model: Document(req.params.database),
              include: [
                { model: TypeDocument(req.params.database) }
              ]
            },
          ]
        },
      ]
    });

    if (data) {
      let company = await Company.findOne({ where: { database: req.params.database } });
      if (company) {
        if (data.currency == 'GTQ') {
          data.currency = 'Q'
        } else {
          data.currency = '$'
        }

        let details = [];
        for (let i = 0; i < data.detailoperations.length; i++) {
          let array = {
            quantity: data.detailoperations[i].quantity,
            price: data.currency + data.detailoperations[i].price,
            discount: data.currency + data.detailoperations[i].discount,
            subtotal: data.currency + data.detailoperations[i].subtotal,
            product: data.detailoperations[i].product,
            description: data.detailoperations[i].description
          }
          details.push(array);
        }

        let customerData;
        if (data.customer) {
          customerData = {
            name: data.customer.name,
            nit: data.customer.nit,
            doc: data.customer.doc
          }
        }
        let supplierData;
        if (data.supplier) {
          supplierData = {
            name: data.supplier.name,
            nit: data.supplier.nit,
            doc: data.supplier.doc
          }
        }
        let branchData;
        if (data.branch) {
          branchData = {
            name: data.branch.name
          }
        }

        let warehouseData;
        if (data.warehouse) {
          warehouseData = {
            name: data.warehouse.name
          }
        }

        let image = 'https://app.felkairos.com/assets/img/favicon.png';
        if (company.image) {
          image = `${req.protocol}://${req.get('host')}${company.image}`;
        }
        const pdfData = {
          image: image,
          serie: data.serie,
          correlative: data.correlative,
          date: moment(data.date).subtract(6, 'hour').format('DD-MM-YYYY HH:mm'),
          type: data.document.typedocument.name,
          status: data.status,
          observations: data.observations,
          currency: data.currency,
          customer: customerData,
          supplier: supplierData,
          branch: branchData,
          warehouse: warehouseData,
          details: details,
          total: data.total,
          subtotal: data.subtotal,
          iva: data.iva,
          discount: data.discount,
          company: company,
          autorizacionFel: data.autorizacionFel,
          serieFel: data.serieFel,
          numberFel: data.numberFel
        }

        var templateHtml = fs.readFileSync(path.join(process.cwd(), `./src/templates/invoice.html`), 'utf8');
        handlebars.registerHelper('getProduct', function (product) {
          return product.name;
        });
        var template = handlebars.compile(templateHtml);
        var html = template(pdfData);
        pdf.create(html, { width: '21cm', height: '30cm', border: '10px', format: 'Letter' }).toBuffer(function (err, pdf) {
          if (err) {
            res.status(200).json({ result: false, message: 'Error al generar factura' });
          } else {
            res.set('Content-Type', 'application/pdf');
            res.send(Buffer.from(pdf));
          }
        });
      } else {
        res.status(200).json({ result: false, message: 'Base de Datos no encontrada' });
      }
    }

  });

  app.get('/:database/invoice/:id/:name', async (req, res) => {
    let data = await Operation(req.params.database).findOne({
      where: { id: req.params.id },
      include: [
        { model: Customer(req.params.database) },
        { model: Supplier(req.params.database) },
        {
          model: Document(req.params.database), include: [
            { model: TypeDocument(req.params.database) }
          ]
        },
        { model: User(req.params.database) },
        { model: Branch(req.params.database) },
        { model: Warehouse(req.params.database) },
        {
          model: DetailOperation(req.params.database),
          include: [
            { model: Product(req.params.database) }
          ]
        },
        {
          model: PaymentOperation(req.params.database)
        },
        {
          model: Operation(req.params.database),
          required: false,
          as: 'notes',
          where: { status: 'CERTIFICADA' },
          include: [
            {
              model: Document(req.params.database),
              include: [
                { model: TypeDocument(req.params.database) }
              ]
            },
          ]
        },
      ]
    });

    if (data) {
      let company = await Company.findOne({ where: { database: req.params.database } });
      if (company) {
        if (data.currency == 'GTQ') {
          data.currency = 'Q'
        } else {
          data.currency = '$'
        }

        let details = [];
        for (let i = 0; i < data.detailoperations.length; i++) {
          let array = {
            quantity: data.detailoperations[i].quantity,
            price: data.currency + data.detailoperations[i].price,
            discount: data.currency + data.detailoperations[i].discount,
            subtotal: data.currency + data.detailoperations[i].subtotal,
            product: data.detailoperations[i].product,
            description: data.detailoperations[i].description
          }
          details.push(array);
        }

        let customerData;
        if (data.customer) {
          customerData = {
            name: data.customer.name,
            nit: data.customer.nit,
            doc: data.customer.doc
          }
        }
        let supplierData;
        if (data.supplier) {
          supplierData = {
            name: data.supplier.name,
            nit: data.supplier.nit,
            doc: data.supplier.doc
          }
        }
        let branchData;
        if (data.branch) {
          branchData = {
            name: data.branch.name
          }
        }

        let warehouseData;
        if (data.warehouse) {
          warehouseData = {
            name: data.warehouse.name
          }
        }

        let image = 'https://app.felkairos.com/assets/img/favicon.png';
        if (company.image) {
          image = `${req.protocol}://${req.get('host')}${company.image}`;
        }
        const pdfData = {
          image: image,
          serie: data.serie,
          correlative: data.correlative,
          date: moment(data.date).subtract(6, 'hour').format('DD-MM-YYYY HH:mm'),
          type: data.document.typedocument.name,
          status: data.status,
          observations: data.observations,
          currency: data.currency,
          customer: customerData,
          supplier: supplierData,
          branch: branchData,
          warehouse: warehouseData,
          details: details,
          total: data.total,
          subtotal: data.subtotal,
          iva: data.iva,
          discount: data.discount,
          company: company,
          autorizacionFel: data.autorizacionFel,
          serieFel: data.serieFel,
          numberFel: data.numberFel
        }

        var templateHtml = fs.readFileSync(path.join(process.cwd(), `./src/templates/invoice.html`), 'utf8');
        handlebars.registerHelper('getProduct', function (product) {
          return product.name;
        });
        var template = handlebars.compile(templateHtml);
        var html = template(pdfData);
        pdf.create(html, { width: '21cm', height: '30cm', border: '10px', format: 'Letter' }).toBuffer(function (err, pdf) {
          if (err) {
            res.status(200).json({ result: false, message: 'Error al generar factura' });
          } else {
            res.set('Content-Type', 'application/pdf');
            res.send(Buffer.from(pdf));
          }
        });
      } else {
        res.status(200).json({ result: false, message: 'Base de Datos no encontrada' });
      }
    }

  });

  app.get('/:database/cxc/:startDate/:endDate/:id/:name', async (req, res) => {
    const range = { [Sequelize.Op.between]: [req.params.startDate + ' 00:00', req.params.endDate + ' 23:59'] };
    let cxc = await Operation(req.params.database).findAll({
      where: {
        customerId: req.params.id,
        payment: 'CREDITO',
        date: range
      },
      include: [
        {
          model: Document(req.params.database),
          include: [
            { model: TypeDocument(req.params.database) }
          ]
        },
        {
          model: Operation(req.params.database),
          include: [
            {
              model: Document(req.params.database),
              include: [
                { model: TypeDocument(req.params.database) }
              ]
            }
          ]
        }
      ],
      raw: true
    });
    let customer = await Customer(req.params.database).findOne({ where: { id: req.params.id }, raw: true });
    let company = await Company.findOne({ where: { database: req.params.database } });
    let debito = 0
    let credito = 0;
    if (company) {

      let image = 'https://app.felkairos.com/assets/img/favicon.png';
      if (company.image) {
        image = `${req.protocol}://${req.get('host')}${company.image}`;
      }
      for (let i = 0; i < cxc.length; i++) {
        if (cxc[i].operationId) {
          debito = debito + parseFloat(cxc[i].total)
        } else {
          credito = credito + parseFloat(cxc[i].total);
        }
      }
      const pdfData = {
        image: image,
        cxc: cxc,
        credito: credito,
        debito: debito,
        saldo: credito - debito,
        customer: customer
      }

      var templateHtml = fs.readFileSync(path.join(process.cwd(), 'src/templates/cxc.html'), 'utf8');

      var template = handlebars.compile(templateHtml);
      handlebars.registerHelper('dateFormat', function (date) {
        return moment(date).format('DD-MM-YYYY, HH:mm');
      });
      var html = template(pdfData);

      pdf.create(html, { width: '21cm', height: '28cm', border: '0px', format: 'Letter' }).toStream(function (err, pdf) {
        if (err) {
          res.status(200).json({ result: false, message: 'Error al generar reporte', err: err });
        } else {
          res.set('Content-Type', 'application/pdf');
          pdf.pipe(res);
        }
      });
    } else {
      res.status(200).json({ result: false, message: 'Base de Datos no encontrada' });
    }

  });

  app.get('/:database/cxp/:startDate/:endDate/:id/:name', async (req, res) => {
    const range = { [Sequelize.Op.between]: [req.params.startDate + ' 00:00', req.params.endDate + ' 23:59'] };
    let cxp = await Operation(req.params.database).findAll({
      where: {
        supplierId: req.params.id,
        payment: 'CREDITO',
        date: range
      },
      include: [
        {
          model: Document(req.params.database),
          include: [
            { model: TypeDocument(req.params.database) }
          ]
        },
        {
          model: Operation(req.params.database),
          include: [
            {
              model: Document(req.params.database),
              include: [
                { model: TypeDocument(req.params.database) }
              ]
            }
          ]
        }
      ],
      raw: true
    });
    let supplier = await Supplier(req.params.database).findOne({ where: { id: req.params.id }, raw: true });
    let company = await Company.findOne({ where: { database: req.params.database } });
    let debito = 0
    let credito = 0;
    if (company) {

      let image = 'https://app.felkairos.com/assets/img/favicon.png';
      if (company.image) {
        image = `${req.protocol}://${req.get('host')}${company.image}`;
      }
      for (let i = 0; i < cxp.length; i++) {
        if (cxp[i].operationId) {
          debito = debito + parseFloat(cxp[i].total)
        } else {
          credito = credito + parseFloat(cxp[i].total);
        }
      }
      const pdfData = {
        image: image,
        cxp: cxp,
        credito: credito,
        debito: debito,
        saldo: credito - debito,
        supplier: supplier
      }

      var templateHtml = fs.readFileSync(path.join(process.cwd(), 'src/templates/cxp.html'), 'utf8');

      var template = handlebars.compile(templateHtml);
      handlebars.registerHelper('dateFormat', function (date) {
        return moment(date).format('DD-MM-YYYY, HH:mm');
      });
      var html = template(pdfData);

      pdf.create(html, { width: '21cm', height: '28cm', border: '0px', format: 'Letter' }).toStream(function (err, stream) {
        if (err) {
          res.status(200).json({ result: false, message: 'Error al generar reporte', err: err });
        } else {
          res.set('Content-Type', 'application/pdf');
          stream.pipe(res);
        }
      });
    } else {
      res.status(200).json({ result: false, message: 'Base de Datos no encontrada' });
    }

  });

  app.post('/reports/operations', async (req, res) => {
    let operations = [];
    let ops = req.body;
    for (let i = 0; i < ops.length; i++) {
      let op = await Operation(req.params.database).findOne({
        where: { id: ops[i] },
        include: [
          { model: Customer(req.params.database) },
          { model: Supplier(req.params.database) },
          {
            model: Document(req.params.database), include: [
              { model: TypeDocument(req.params.database) }
            ]
          },
          { model: User(req.params.database) },
          { model: Branch(req.params.database) },
          {
            model: DetailOperation(req.params.database),
            include: [
              { model: Product(req.params.database) }
            ]
          },
          {
            model: PaymentOperation(req.params.database)
          },
          {
            model: Operation(req.params.database),
            required: false,
            as: 'notes',
            where: { status: 'CERTIFICADA' },
            include: [
              {
                model: Document(req.params.database),
                include: [
                  { model: TypeDocument(req.params.database) }
                ]
              },
            ]
          },
        ]
      });

      let customerData;
      if (op.customer) {
        customerData = {
          name: op.customer.name,
          nit: op.customer.nit,
          doc: op.customer.doc
        }
      }
      let supplierData;
      if (op.supplier) {
        supplierData = {
          name: op.supplier.name,
          nit: op.supplier.nit,
          doc: op.supplier.doc
        }
      }

      operations.push({
        serie: op.serie,
        correlative: op.correlative,
        date: moment(op.date).subtract(6, 'hour').format('DD-MM-YYYY HH:mm'),
        type: op.document.typedocument.name,
        status: op.status,
        type: op.document.typedocument.name,
        observations: op.observations,
        currency: op.currency,
        customer: customerData,
        supplier: supplierData,
        details: op.detailoperations,
        total: op.total,
        autorizacionFel: op.autorizacionFel,
        serieFel: op.serieFel,
        numberFel: op.numberFel
      });
    }

    let company = await Company.findOne({ where: { database: req.params.database } });
    if (company) {

      let image = 'https://app.felkairos.com/assets/img/favicon.png';
      if (company.image) {
        image = `${req.protocol}://${req.get('host')}${company.image}`;
      }
      const pdfData = {
        image: image,
        operations: operations
      }

      var templateHtml = fs.readFileSync(path.join(process.cwd(), 'src/templates/operations.html'), 'utf8');
      handlebars.registerHelper('totalOperations', function (operations) {
        return operations.length;
      });
      handlebars.registerHelper('totalCertificadas', function (operations) {
        return operations.filter((t) => t.status === 'CERTIFICADA').length;
      });
      handlebars.registerHelper('totalAnuladas', function (operations) {
        return operations.filter((t) => t.status === 'ANULADA').length;
      });
      handlebars.registerHelper('getTotal', function (operations) {
        var total = 0;
        for (var i = 0; i < operations.length; i++) {
          if (operations[i].status == 'CERTIFICADA') {
            total = total + parseFloat(operations[i].total);
          }
        }
        return total;
      });
      handlebars.registerHelper('getTotalCond', function (status, total) {
        if (status == 'CERTIFICADA') {
          return total;
        } else {
          return '0.00';
        }
      });
      handlebars.registerHelper('iconByStatus', function (t) {
        switch (t) {
          case 'CERTIFICADA': return 'status-certificada'
          case 'ANULADA': return 'status-anulada'
        }
      });
      handlebars.registerHelper('getCurrency', function (t) {
        switch (t) {
          case 'GTQ': return 'Q'
          case 'USD': return '$'
        }
      });

      var template = handlebars.compile(templateHtml);
      var html = template(pdfData);

      var url = `/docs/${company.database}/reports/operations/${moment().unix()}.pdf`;

      pdf.create(html, { width: '21cm', height: '28cm', border: '15px', format: 'Letter' }).toFile('./src' + url, function (err, pdf) {
        if (err) {
          res.status(200).json({ result: false, message: 'Error al generar reporte' });
        } else {
          res.status(200).json({ result: true, message: 'Reporte generado', url: url });
        }
      });
    } else {
      res.status(200).json({ result: false, message: 'Base de Datos no encontrada' });
    }

  });

  app.get('/:database/stocks/:date/:branch/:warehouse/:product/:variation/:name', async (req, res) => {

    let company = await Company.findOne({ where: { database: req.params.database } });
    if (company) {

      let branches = [];
      let warehouses = [];
      let products = [];
      if (req.params.product == 'null') {
        products = await Product(req.params.database).findAll({
          include: [
            { model: Unit(req.params.database) },
            { model: Unit(req.params.database), as: 'entryUnit' }
          ],
          raw: true,
          nest: true,
        });
      } else {
        products[0] = await Product(req.params.database).findOne({
          where: { id: parseInt(req.params.product) },
          include: [
            { model: Unit(req.params.database) },
            { model: Unit(req.params.database), as: 'entryUnit' }
          ],
          raw: true,
          nest: true,
        });
      }

      if (req.params.branch == 'null') {
        branches = await Branch(req.params.database).findAll({
          attributes: ['id', 'name'],
          raw: true,
          nest: true,
        });
      } else {
        branches[0] = await Branch(req.params.database).findOne({
          where: { id: req.params.branch },
          attributes: ['id', 'name'],
          raw: true,
          nest: true,
        });
      }

      if (req.params.warehouse == 'null') {
        warehouses = await Warehouse(req.params.database).findAll({
          attributes: ['id', 'name'],
          raw: true,
          nest: true,
        });
      } else {
        warehouses[0] = await Warehouse(req.params.database).findOne({
          where: { id: req.params.warehouse },
          attributes: ['id', 'name'],
          raw: true,
          nest: true,
        });
      }

      let stocks = [];
      let total_stock = 0;
      let total_branches = 0;
      let total_warehouses = 0;
      let total_products = 0;

      total_products = products.length;
      total_branches = total_branches + branches.length;
      total_warehouses = total_warehouses + warehouses.length;
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
            let costProm = await Cost(req.params.database).findOne({
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
            let variations = await Variation(req.params.database).findAll({
              where: { productId: products[p].id },
              include: [
                {
                  model: Attribute(req.params.database), required: false,
                }
              ],
              raw: true,
              nest: true,
            });
            if (variations.length == 0) {
              let where = {
                productId: products[p].id,
                branchId: branches[b].id,
                warehouseId: warehouses[w].id,
                date: { [Sequelize.Op.lte]: moment(req.params.date).format('YYYY-MM-DD HH:mm:ss') }
              }
              let stock = await Kardex(req.params.database).findOne({
                where: where,
                include: [
                  {
                    model: Operation(req.params.database), attributes: ['date'], required: false,
                  }
                ],
                raw: true,
                nest: true,
                order: [[Operation(req.params.database), "date", "DESC"]]
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
                  let stock = await Kardex(req.params.database).findOne({
                    where: where,
                    include: [
                      {
                        model: Operation(req.params.database), attributes: ['date'], required: false,
                      },
                      {
                        model: Variation(req.params.database), required: false,
                        include: [
                          { model: Attribute(req.params.database) }
                        ],
                        raw: true,
                        nest: true,
                      }
                    ],
                    raw: true,
                    nest: true,
                    order: [[Operation(req.params.database), "date", "DESC"]]
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
                let stock = await Kardex(req.params.database).findOne({
                  where: where,
                  include: [
                    {
                      model: Operation(req.params.database), attributes: ['date'], required: false,
                    },
                    {
                      model: Variation(req.params.database), required: false,
                      include: [
                        { model: Attribute(req.params.database) }
                      ],
                      raw: true,
                      nest: true,
                    }
                  ],
                  raw: true,
                  nest: true,
                  order: [[Operation(req.params.database), "date", "DESC"]]
                });
                if (stock) {
                  total_stock = total_stock + parseFloat(stock.stock);
                  stocks[b].warehouses[w].products[p].data.push(stock);
                } else {
                  stocks[b].warehouses[w].products[p].data.push({
                    stock: 0,
                    variationId: req.params.variation,
                    variation: await Variation(req.params.database).findOne({
                      where: { id: req.params.variation }, include: [
                        { model: Attribute(req.params.database) }
                      ],
                      raw: true,
                      nest: true,
                    })
                  });
                }
              }
            }
          }
        }
      }

      let image = 'https://app.felkairos.com/assets/img/favicon.png';
      if (company.image) {
        image = `${req.protocol}://${req.get('host')}${company.image}`;
      }
      const pdfData = {
        image: image,
        stocks: stocks,
        total_stock: total_stock,
        total_products: total_products,
        total_branches: total_branches,
        total_warehouses: total_warehouses
      }

      var templateHtml = fs.readFileSync(path.join(process.cwd(), 'src/templates/stocks.html'), 'utf8');


      handlebars.registerHelper('getCostProm', function (costProm) {
        return decimal(costProm.cost);
      });
      handlebars.registerHelper('getCostTotal', function (costProm, stock) {
        let total = (costProm.cost / 1.12) * stock;
        return decimal(total);
      });
      handlebars.registerHelper('total_cost', function () {
        let total = 0;
        for (let b = 0; b < stocks.length; b++) {
          for (let w = 0; w < stocks[b].warehouses.length; w++) {
            for (let p = 0; p < stocks[b].warehouses[w].products.length; p++) {
              if (stocks[b].warehouses[w].products[p].data.length > 1) {
                for (let d = 0; d < stocks[b].warehouses[w].products[p].data.length; d++) {
                  let cost = stocks[b].warehouses[w].products[p].costProm.cost;
                  let stock = stocks[b].warehouses[w].products[p].data[d].stock;
                  total = parseFloat(decimal(total)) + ((cost / 1.12) * stock);
                }
              } else {
                let cost = stocks[b].warehouses[w].products[p].costProm.cost;
                let stock = stocks[b].warehouses[w].products[p].data[0].stock;
                total = parseFloat(decimal(total)) + ((cost / 1.12) * stock);
              }
            }
          }
        }
        return decimal(total)
      });

      var template = handlebars.compile(templateHtml);
      var html = template(pdfData);

      pdf.create(html, { orientation: 'landscape' }).toStream(function (err, pdf) {
        if (err) {
          res.send(err);
        } else {
          res.set('Content-Type', 'application/pdf');
          pdf.pipe(res);
        }
      });
    } else {
      res.send('Base de Datos no encontrada');
    }

  });

  function decimal(number) {
    return (Math.round((parseFloat(number) + Number.EPSILON) * 100) / 100).toFixed(2);
  }

} export default reportRoute;