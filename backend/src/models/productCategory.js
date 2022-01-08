import db from '../database/db.js';
import Sequelize from 'sequelize';

function ProductCategory(req) {
  const Model = db(req).define('productscategories', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING
  }, {
    createdAt: false,
    updatedAt: false,
  });

  return Model;
}

export default ProductCategory;