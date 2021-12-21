import db from '../database/db.js';
import Sequelize from 'sequelize';

function Supplier(database) {
  const Model = db(database).define('suppliers', {
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