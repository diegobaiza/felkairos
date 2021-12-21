import db from '../database/db.js';
import Sequelize from 'sequelize';
import Attribute from './attribute.js';

function Variation(database) {
  const Model = db(database).define('variations', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    productId: Sequelize.INTEGER,
    attributeId: Sequelize.INTEGER
  }, {
    createdAt: false,
    updatedAt: false,
  });

  Model.belongsTo(Attribute(database));
  Attribute(database).hasMany(Model);

  return Model;
}

export default Variation;