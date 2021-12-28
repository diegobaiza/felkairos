import db from '../database/db.js';
import Sequelize from 'sequelize';
import Role from './role.js';

function User(req) {
  const Model = db(req).define('users', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING,
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    color: Sequelize.STRING,
    access: Sequelize.BOOLEAN,
    roleId: Sequelize.INTEGER
  }, {
    createdAt: false,
    updatedAt: false,
  });

  Model.belongsTo(Role(req));
  Role(req).hasMany(Model);

  return Model;
}

export default User;