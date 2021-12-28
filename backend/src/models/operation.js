import db from '../database/db.js';
import Sequelize from 'sequelize';
import Customer from './customer.js';
import Supplier from './supplier.js';
import Document from './document.js';
import User from './user.js';
import Branch from './branch.js';
import Warehouse from './warehouse.js';
import DetailOperation from './detailOperation.js';
import PaymentOperation from './paymentOperation.js';

function Operation(req) {
  const Model = db(req).define('operations', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    serie: Sequelize.STRING,
    correlative: Sequelize.STRING,
    date: Sequelize.DATE,
    nit: Sequelize.STRING,
    total: Sequelize.DECIMAL,
    subtotal: Sequelize.DECIMAL,
    iva: Sequelize.DECIMAL,
    isr: Sequelize.DECIMAL,
    discount: Sequelize.DECIMAL,
    exchange: Sequelize.DECIMAL,
    turned: Sequelize.DECIMAL,
    currency: Sequelize.STRING,
    payment: Sequelize.STRING,
    observations: Sequelize.STRING,
    autorizacionFel: Sequelize.STRING,
    serieFel: Sequelize.STRING,
    numberFel: Sequelize.STRING,
    status: Sequelize.STRING,
    customerId: Sequelize.INTEGER,
    supplierId: Sequelize.INTEGER,
    documentId: Sequelize.INTEGER,
    userId: Sequelize.INTEGER,
    branchId: Sequelize.INTEGER,
    warehouseId: Sequelize.INTEGER,
    operationId: Sequelize.INTEGER
  }, {
    createdAt: false,
    updatedAt: false,
  });

  Model.belongsTo(Customer(req));
  Customer(req).hasMany(Model);

  Model.belongsTo(Supplier(req));
  Supplier(req).hasMany(Model);

  Model.belongsTo(Document(req));
  Document(req).hasMany(Model);

  Model.belongsTo(User(req));
  User(req).hasMany(Model);

  Model.belongsTo(Branch(req));
  Branch(req).hasMany(Model);

  Model.belongsTo(Warehouse(req));
  Warehouse(req).hasMany(Model);

  Model.belongsTo(Model);
  Model.hasMany(Model, {
    as: 'notes'
  });

  DetailOperation(req).belongsTo(Model);
  Model.hasMany(DetailOperation(req));

  PaymentOperation(req).belongsTo(Model);
  Model.hasMany(PaymentOperation(req));

  return Model;
}

export default Operation;