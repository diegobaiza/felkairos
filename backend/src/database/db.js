import Sequelize from 'sequelize';

function db(database) {
  return new Sequelize(database, 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-06:00',
    logging: false
  });
}

export default db;