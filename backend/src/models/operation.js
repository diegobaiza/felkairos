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

function Operation(database) {
  const Model = db(database).define('operations', {
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

  Model.belongsTo(Customer(database));
  Customer(database).hasMany(Model);

  Model.belongsTo(Supplier(database));
  Supplier(database).hasMany(Model);

  Model.belongsTo(Document(database));
  Document(database).hasMany(Model);

  Model.belongsTo(User(database));
  User(database).hasMany(Model);

  Model.belongsTo(Branch(database));
  Branch(database).hasMany(Model);

  Model.belongsTo(Warehouse(database));
  Warehouse(database).hasMany(Model);

  Model.belongsTo(Model);
  Model.hasMany(Model, {
    as: 'notes'
  });

  DetailOperation(database).belongsTo(Model);
  Model.hasMany(DetailOperation(database));

  PaymentOperation(database).belongsTo(Model);
  Model.hasMany(PaymentOperation(database));

  return Model;
}

export default Operation;