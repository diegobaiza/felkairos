import jwt from 'jsonwebtoken';
import key from './key.js';

function token(tk) {
  console.log(key);
  try {
    let token = jwt.verify(tk, key);
    return token.database;
  } catch (error) {
    return tk;
  }
}

export default token;