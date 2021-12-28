import Operation from '../models/operation.js';
import DetailOperation from '../models/detailOperation.js';
import PaymentOperation from '../models/paymentOperation.js';
import Customer from '../models/customer.js';
import Supplier from '../models/supplier.js';
import Document from '../models/document.js';
import TypeDocument from '../models/typeDocument.js';
import User from '../models/user.js';
import Branch from '../models/branch.js';
import auth from '../middleware/auth.js';
import Product from '../models/product.js';
import Sequelize from 'sequelize';

function dashboardRoute(app) {

  app.get('/dashboard/counters', auth, async (req, res) => {
    const users = await User(req).count();
    const customers = await Customer(req).count();
    const suppliers = await Supplier(req).count();
    const branches = await Branch(req).count();
    const products = await Product(req).count();
    const documents = await Document(req).count();
    const operations = await Operation(req).count();
    res.status(200).json({
      result: true, data: { users, customers, suppliers, branches, products, documents, operations }
    });
  });

  app.get('/dashboard/year/:year/:type', auth, async (req, res) => {
    let ops = [];
    for (let i = 0; i < 12; i++) {
      const range = { [Sequelize.Op.between]: [`${req.params.year}-${i + 1}-01`, `${req.params.year}-${i + 2}-01`] };
      const operations = await Operation(req).count({
        where: { date: range },
        include: [{
          model: Document(req), required: true, include: [
            { model: TypeDocument(req), required: true, where: { name: req.params.type } }
          ]
        }]
      });
      ops.push(operations);
    }
    res.status(200).json({
      result: true, data: ops
    });
  });

  app.get('/dashboard/:startDate/:endDate', auth, (req, res) => {
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
            { model: Product(req) }
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

  app.get('/dashboard/operations/:startDate/:endDate', auth, async (req, res) => {
    const range = { [Sequelize.Op.between]: [req.params.startDate + ' 00:00', req.params.endDate + ' 23:59'] };
    let operations = [
      { name: 'COMPRA', count: null },
      { name: 'FACTURA', count: null },
      { name: 'FACTURA CAMBIARIA', count: null },
      { name: 'NOTA DE CREDITO', count: null },
      { name: 'NOTA DE DEBITO', count: null },
      { name: 'NOTA DE ABONO', count: null },
      { name: 'FACTURA ESPECIAL', count: null },
      { name: 'RECIBO', count: null },
      { name: 'RECIBO POR DONACION', count: null },
      { name: 'CARGA INVENTARIO', count: null },
      { name: 'DESCARGA INVENTARIO', count: null },
      { name: 'TRASLADO', count: null }
    ];
    for (let i = 0; i < operations.length; i++) {
      operations[i].count = await Operation(req).count({
        where: { date: range },
        include: [{
          model: Document(req), required: true, include: [
            { model: TypeDocument(req), required: true, where: { name: operations[i].name } }
          ]
        }]
      });
    }
    res.status(200).json({ result: true, data: operations });
  });

} export default dashboardRoute;