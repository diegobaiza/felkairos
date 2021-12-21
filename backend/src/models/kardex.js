import db from '../database/db.js';
import Sequelize from 'sequelize';
import Product from './product.js';
import Operation from './operation.js';
import Branch from './branch.js';
import Warehouse from './warehouse.js';
import Variation from './variation.js';

function Kardex(database) {
  const Model = db(database).define('kardex', {
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

  Model.belongsTo(Product(database));
  Product(database).hasMany(Model);

  Model.belongsTo(Variation(database));
  Variation(database).hasMany(Model);

  Model.belongsTo(Branch(database));
  Branch(database).hasMany(Model);

  Model.belongsTo(Warehouse(database));
  Warehouse(database).hasMany(Model);

  Model.belongsTo(Operation(database));
  Operation(database).hasMany(Model);

  return Model;
}

export default Kardex;