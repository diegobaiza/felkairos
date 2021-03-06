import db from '../database/db.js';
import Sequelize from 'sequelize';
import User from './user.js';

function Role(req) {
  const Model = db(req).define('roles', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING
  }, {
    createdAt: false,
    updatedAt: false,
  });

  return Model;
}

export default Role;