import db from '../database/db.js';
import Sequelize from 'sequelize';
import TypeDocument from './typeDocument.js';
import Branch from './branch.js';
import Warehouse from './warehouse.js';

function Document(database) {
  const Model = db(database).define('documents', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING,
    image: Sequelize.STRING,
    serie: Sequelize.STRING,
    correlative: Sequelize.STRING,
    primaryColor: Sequelize.STRING,
    secondaryColor: Sequelize.STRING,
    typeDocumentId: Sequelize.INTEGER,
    branchId: Sequelize.INTEGER,
    warehouseId: Sequelize.INTEGER,
  }, {
    createdAt: false,
    updatedAt: false,
  });

  Model.belongsTo(TypeDocument(database));
  TypeDocument(database).hasMany(Model);

  Model.belongsTo(Branch(database));
  Branch(database).hasMany(Model);

  Model.belongsTo(Warehouse(database));
  Warehouse(database).hasMany(Model);

  return Model;
}

export default Document;