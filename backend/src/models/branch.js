import db from '../database/db.js';
import Sequelize from 'sequelize';

function Branch(database) {
  const Model = db(database).define('branches', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING,
    number: Sequelize.INTEGER,
    address: Sequelize.STRING,
    phone: Sequelize.STRING
  }, {
    createdAt: false,
    updatedAt: false,
  });
  return Model;
}

export default Branch;