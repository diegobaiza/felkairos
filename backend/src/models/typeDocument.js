import db from '../database/db.js';
import Sequelize from 'sequelize';

function TypeDocument(req) {
  const Model = db(req).define('typedocuments', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING,
    inventory: Sequelize.STRING,
    note: Sequelize.BOOLEAN,
    certification: Sequelize.BOOLEAN,
    products: Sequelize.BOOLEAN,
    branch: Sequelize.BOOLEAN,
    warehouse: Sequelize.BOOLEAN,
    customer: Sequelize.BOOLEAN,
    supplier: Sequelize.BOOLEAN,
    currency: Sequelize.BOOLEAN,
    details: Sequelize.BOOLEAN,
    operation: Sequelize.BOOLEAN,
    payment: Sequelize.BOOLEAN,
    abonos: Sequelize.BOOLEAN,
    totals: Sequelize.BOOLEAN,
    coupons: Sequelize.BOOLEAN
  }, {
    createdAt: false,
    updatedAt: false,
  });
  return Model;
}

export default TypeDocument;