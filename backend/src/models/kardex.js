import db from '../database/db.js';
import Sequelize from 'sequelize';
import Product from './product.js';
import Operation from './operation.js';
import Branch from './branch.js';
import Warehouse from './warehouse.js';
import Variation from './variation.js';

function Kardex(req) {
  const Model = db(req).define('kardex', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    date: Sequelize.DATE,
    type: Sequelize.STRING,
    quantity: Sequelize.DECIMAL,
    stock: Sequelize.DECIMAL,
    cost: Sequelize.DECIMAL,
    price: Sequelize.DECIMAL,
    productId: Sequelize.INTEGER,
    variationId: Sequelize.INTEGER,
    branchId: Sequelize.INTEGER,
    warehouseId: Sequelize.INTEGER,
    operationId: Sequelize.INTEGER
  }, {
    createdAt: false,
    updatedAt: false,
    freezeTableName: true
  });

  Model.belongsTo(Product(req));
  Product(req).hasMany(Model);

  Model.belongsTo(Variation(req));
  Variation(req).hasMany(Model);

  Model.belongsTo(Branch(req));
  Branch(req).hasMany(Model);

  Model.belongsTo(Warehouse(req));
  Warehouse(req).hasMany(Model);

  Model.belongsTo(Operation(req));
  Operation(req).hasMany(Model);

  return Model;
}

export default Kardex;