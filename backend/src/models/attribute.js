import db from '../database/db.js';
import Sequelize from 'sequelize';

function Attribute(req) {
  const Model = db(req).define('attributes', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING,
    symbol: Sequelize.STRING
  }, {
    createdAt: false,
    updatedAt: false,
  });
  return Model;
}

export default Attribute;