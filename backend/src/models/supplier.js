import db from '../database/db.js';
import Sequelize from 'sequelize';

function Supplier(req) {
  const Model = db(req).define('suppliers', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    nit: Sequelize.STRING,
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    doc: Sequelize.STRING
  }, {
    createdAt: false,
    updatedAt: false,
  });
  return Model;
}

export default Supplier;