import conn from '../database/conn.js';
import Sequelize from 'sequelize';

let Company = conn.define('companies', {
  id: { type: Sequelize.SMALLINT, primaryKey: true },
  image: Sequelize.STRING,
  name: Sequelize.STRING,
  nit: Sequelize.STRING,
  address: Sequelize.STRING,
  phone: Sequelize.STRING,
  email: Sequelize.STRING,
  tax: Sequelize.BOOLEAN,
  iva: Sequelize.INTEGER,
  exchange: Sequelize.DECIMAL,
  documents: Sequelize.INTEGER,
  extra: Sequelize.STRING,
  access: Sequelize.BOOLEAN,
  printer: Sequelize.BOOLEAN,
  tabs: Sequelize.INTEGER,
  database: Sequelize.STRING,
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  exp: Sequelize.STRING,
  stock: Sequelize.BOOLEAN,
  token: Sequelize.STRING
}, {
  createdAt: false,
  updatedAt: false,
});

export default Company;