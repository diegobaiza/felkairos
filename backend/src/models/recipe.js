import db from '../database/db.js';
import Sequelize from 'sequelize';

function Recipe(req) {
  const Model = db(req).define('recipes', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    quantity: Sequelize.DECIMAL,
    productId: Sequelize.INTEGER,
    variationId: Sequelize.INTEGER,
    productRecipeId: Sequelize.INTEGER
  }, {
    createdAt: false,
    updatedAt: false,
  });

  return Model;
}

export default Recipe;