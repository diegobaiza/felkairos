import conn from '../database/conn.js';
import db from '../database/db.js';
import Company from "../models/company.js";
import hash from 'password-hash';
import Sequelize from 'sequelize';
import fs from 'fs';
import auth from '../middleware/auth.js';

function companyRoute(app) {

  let dirname = 'src/docs';

  app.get('/companies', auth, (req, res) => {
    Company.findAll().then(async data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.get('/companies/:id', auth, (req, res) => {
    Company.findOne({ where: { id: req.params.id } }).then(data => {
      res.status(200).json({ result: true, data: data });
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.post('/companies', async (req, res) => {
    let dbSql = await conn.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${req.body.database}'`, { type: Sequelize.QueryTypes.RAW });
    dbSql = JSON.parse(JSON.stringify(dbSql[0]));
    if (dbSql[0]) {
      res.status(200).json({ result: false, message: 'Base de Datos ya Existente' });
    } else {

      await conn.query(`CREATE DATABASE ${req.body.database}`, { type: Sequelize.QueryTypes.RAW });

      const file = fs.readFileSync('src/database/script.sql').toString();
      const scripts = file.split(';');
      for (let i = 0; i < scripts.length - 1; i++) {
        await db(req.body.database).query(scripts[i], { type: Sequelize.QueryTypes.RAW });
      }

      fs.mkdirSync(`src/docs/${req.body.database}/invoices`, { recursive: true });
      fs.mkdirSync(`src/docs/${req.body.database}/products`, { recursive: true });
      fs.mkdirSync(`src/docs/${req.body.database}/reports`, { recursive: true });
      fs.mkdirSync(`src/docs/${req.body.database}/documents`, { recursive: true });
      fs.mkdirSync(`src/docs/${req.body.database}/logo`, { recursive: true });

      Company.create(req.body).then(data => {
        data.id = data.null;
        res.status(200).json({ result: true, message: 'Empresa Creada', data: data });
      }).catch(err => {
        res.status(200).json({ result: false, message: err });
      });

    }
  });

  app.put('/companies/:id', auth, (req, res) => {
    Company.update(req.body, { where: { id: req.params.id } }).then(data => {
      if (data[0] == 1) {
        res.status(200).json({ result: true, message: 'Empresa Actualizada' });
      } else {
        res.status(200).json({ result: true, message: 'Sin Cambios' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.put('/companies/password/:id', auth, (req, res) => {
    var password = req.body.password;
    Company.findOne({ where: { id: req.params.id } }).then(data => {
      if (data) {
        if (hash.verify(password, data.password)) {
          Company.update({ password: hash.generate(req.body.new_password) }, { where: { id: req.params.id } }).then(data => {
            data.id = data.null;
            res.status(200).json({ result: true, message: 'Contraseña Actualizada' });
          }).catch(err => {
            res.status(200).json({ result: false, message: err });
          });
        } else {
          res.status(200).json({ result: false, message: 'Contraseña Actual Inválida' });
        }
      } else {
        res.status(200).json({ result: false, message: 'Usuario Inválido' });
      }
    }).catch(err => {
      res.status(200).json({ result: false, message: err });
    });
  });

  app.delete('/companies/:id', auth, async (req, res) => {
    Company.findOne({ where: { id: req.params.id } }).then(async company => {
      if (company) {
        let db = await conn.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${company.database}'`, { type: Sequelize.QueryTypes.RAW });
        db = JSON.parse(JSON.stringify(db[0]));
        if (db[0]) {
          await conn.query(`DROP DATABASE ${company.database}`, { type: Sequelize.QueryTypes.RAW });
          Company.destroy({ where: { id: company.id } }).then(async data => {
            if (data == 1) {
              let folder = `${dirname}/${company.database}`;
              if (fs.existsSync(folder)) {
                fs.rmSync(folder, { recursive: true });
              }
              res.status(200).json({ result: true, message: 'Empresa Eliminada' });
            } else {
              res.status(200).json({ result: false, message: 'Sin Cambios' });
            }
          }).catch(err => {
            res.status(200).json({ result: false, message: err });
          });
        } else {
          res.status(200).json({ result: false, message: 'Base de Datos Inexistente' });
        }
      } else {
        res.status(200).json({ result: false, message: 'Usuario Inexistente' });
      }
    });
  });

} export default companyRoute;