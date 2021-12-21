import db from '../database/db.js';
import Sequelize from 'sequelize';
import Branch from './branch.js';

function Warehouse(database) {
  const Model = db(database).define('warehouses', {
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

  Model.belongsTo(Branch(database));
  Branch(database).hasMany(Model);

  return Model;
}

export default Warehouse;