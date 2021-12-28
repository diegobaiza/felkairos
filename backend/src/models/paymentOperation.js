import db from '../database/db.js';
import { Sequelize } from 'sequelize';

function PaymentOperation(req) {
  const Model = db(req).define('paymentoperations', {
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    type: Sequelize.STRING,
    auth: Sequelize.STRING,
    total: Sequelize.DECIMAL,
    operationId: Sequelize.INTEGER
  }, {
    createdAt: false,
    updatedAt: false,
  });

  return Model;
}

export default PaymentOperation;