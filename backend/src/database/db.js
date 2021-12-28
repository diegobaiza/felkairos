import Sequelize from 'sequelize';
import token from '../middleware/token.js';

function db(req) {
  return new Sequelize(token(req.headers.authorization), 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-06:00',
    logging: false
  });
}

export default db;