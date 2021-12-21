import conn from '../database/conn.js';
import Sequelize from 'sequelize';

let Admin = conn.define('admin', {
  id: { type: Sequelize.SMALLINT, primaryKey: true },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  username: Sequelize.STRING,
  password: Sequelize.STRING
}, {
  createdAt: false,
  updatedAt: false,
  tableName: 'admin'
});

export default Admin;