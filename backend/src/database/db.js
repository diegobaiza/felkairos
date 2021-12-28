import Sequelize from 'sequelize';
import jwt from 'jsonwebtoken';
import key from '../middleware/key.js';

function db(req) {
  let token = req;
  if (typeof req == 'object') {
    token = (jwt.verify(req.headers.authorization, key)).database;
  }
  return new Sequelize(token, 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-06:00',
    logging: false
  });
}

export default db;