import Sequelize from 'sequelize';

let conn = new Sequelize('felkairos', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  timezone: '-06:00',
  logging: false
});

export default conn;