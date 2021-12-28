import db from '../database/db.js';
import Sequelize from 'sequelize';

function Unit(req) {
  const Model = db(req).define('units', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING,
    symbol: Sequelize.STRING
  }, {
    createdAt: false,
    updatedAt: false,
  });
  return Model;
}

export default Unit;