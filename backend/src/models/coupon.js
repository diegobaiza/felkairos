import db from '../database/db.js';
import Sequelize from 'sequelize';

function Coupons(database) {
  const Model = db(database).define('coupons', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING,
    code: Sequelize.STRING,
    amount: Sequelize.DECIMAL,
  }, {
    createdAt: false,
    updatedAt: false,
  });
  return Model;
}

export default Coupons;