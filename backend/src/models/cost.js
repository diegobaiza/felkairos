import db from '../database/db.js';
import Sequelize from 'sequelize';
import Product from './product.js';
import Operation from './operation.js';

function Cost(req) {
  const Model = db(req).define('costs', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    date: Sequelize.DATE,
    cost: Sequelize.DECIMAL,
    price: Sequelize.DECIMAL,
    productId: Sequelize.INTEGER,
    operationId: Sequelize.INTEGER
  }, {
    createdAt: false,
    updatedAt: false
  });

  Model.belongsTo(Product(req));
  Product(req).hasMany(Model, {
    foreignKey: 'productId', as: 'costProm'
  });

  Model.belongsTo(Operation(req));
  Operation(req).hasMany(Model);

  return Model;
}

export default Cost;