import jwt from 'jsonwebtoken';
import key from './key.js';

function token(tk) {
    let token = jwt.verify(tk, key);
    return token.database;
}

export default token;