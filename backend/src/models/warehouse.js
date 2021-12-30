import db from '../database/db.js';
import Sequelize from 'sequelize';
import Branch from './branch.js';

function Warehouse(req) {
  const Model = db(req).define('warehouses', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING,
    number: Sequelize.INTEGER,
    address: Sequelize.STRING,
    phone: Sequelize.STRING,
    branchId: Sequelize.INTEGER
  }, {
    createdAt: false,
    updatedAt: false,
  });

  Model.belongsTo(Branch(req));
  Branch(req).hasMany(Model);

  return Model;
}

export default Warehouse;