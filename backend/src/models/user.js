import db from '../database/db.js';
import Sequelize from 'sequelize';

function User(database) {
  const Model = db(database).define('users', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING,
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    color: Sequelize.STRING,
    access: Sequelize.BOOLEAN
  }, {
    createdAt: false,
    updatedAt: false,
  });
  return Model;
}

export default User;