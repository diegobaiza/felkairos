import db from '../database/db.js';
import Sequelize from 'sequelize';
import Product from './product.js';

function DetailOperation(req) {
  const Model = db(req).define('detailoperations', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    quantity: Sequelize.DECIMAL,
    cost: Sequelize.DECIMAL,
    price: Sequelize.DECIMAL,
    discount: Sequelize.DECIMAL,
    description: Sequelize.STRING,
    subtotal: Sequelize.DECIMAL,
    productId: Sequelize.INTEGER,
    operationId: Sequelize.INTEGER
  }, {
    createdAt: false,
    updatedAt: false,
  });

  Model.belongsTo(Product(req));
  Product(req).hasMany(Model);

  return Model;
}

export default DetailOperation;