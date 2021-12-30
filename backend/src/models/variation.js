import db from '../database/db.js';
import Sequelize from 'sequelize';
import Attribute from './attribute.js';

function Variation(req) {
  const Model = db(req).define('variations', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    productId: Sequelize.INTEGER,
    attributeId: Sequelize.INTEGER
  }, {
    createdAt: false,
    updatedAt: false,
  });

  Model.belongsTo(Attribute(req));
  Attribute(req).hasMany(Model);

  return Model;
}

export default Variation;