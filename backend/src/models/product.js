import db from '../database/db.js';
import Sequelize from 'sequelize';
import Unit from './unit.js';
import Recipe from './recipe.js';
import Variation from './variation.js';

function Product(database) {
  const Model = db(database).define('products', {
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

  Model.belongsTo(Unit(database));
  Unit(database).hasMany(Model);

  Model.belongsTo(Unit(database), {
    foreignKey: 'entryUnitId', as: 'entryUnit'
  });

  Recipe(database).belongsTo(Model);
  Model.hasMany(Recipe(database));

  Variation(database).belongsTo(Model);
  Model.hasMany(Variation(database));

  return Model;
}

export default Product;