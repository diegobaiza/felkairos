import db from '../database/db.js';
import Sequelize from 'sequelize';
import Unit from './unit.js';
import Recipe from './recipe.js';
import Variation from './variation.js';

function Product(req) {
  const Model = db(req).define('products', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING,
    image: Sequelize.STRING,
    sku: Sequelize.STRING,
    type: Sequelize.STRING,
    cost: Sequelize.DECIMAL,
    price: Sequelize.DECIMAL,
    unitId: Sequelize.INTEGER,
    equivalence: Sequelize.DECIMAL,
    entryUnitId: Sequelize.INTEGER
  }, {
    createdAt: false,
    updatedAt: false,
  });

  Model.belongsTo(Unit(req));
  Unit(req).hasMany(Model);

  Model.belongsTo(Unit(req), {
    foreignKey: 'entryUnitId', as: 'entryUnit'
  });

  Recipe(req).belongsTo(Model);
  Model.hasMany(Recipe(req));

  Variation(req).belongsTo(Model);
  Model.hasMany(Variation(req));

  return Model;
}

export default Product;