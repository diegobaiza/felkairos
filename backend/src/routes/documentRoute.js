import Document from '../models/document.js';
import TypeDocument from '../models/typeDocument.js';
import Branch from '../models/branch.js';
import Warehouse from '../models/warehouse.js';
import auth from '../middleware/auth.js';
import fs from 'fs';

function documentRoute(app) {

    let dirname = 'src/docs';

    app.get('/documents', auth, (req, res) => {
        Document(req).findAll({
            include: [
                { model: TypeDocument(req) },
                { model: Branch(req) },
                { model: Warehouse(req) }
            ]
        }).then(data => {
            res.status(200).json({ result: true, data: data });
        }).catch(err => {
            res.status(200).json({ result: false, message: err });
        });
    });

    app.get('/documents/:id', auth, (req, res) => {
        Document(req).findOne({
            where: { id: req.params.id },
            include: [
                { model: TypeDocument(req) },
                { model: Branch(req) },
                { model: Warehouse(req) }
            ]
        }).then(data => {
            res.status(200).json({ result: true, data: data });
        }).catch(err => {
            res.status(200).json({ result: false, message: err });
        });
    });

    app.post('/documents', auth, (req, res) => {
        Document(req).create(req.body).then(data => {
            data.id = data.null;
            res.status(200).json({ result: true, message: 'Documento Agregado', data: data });
        }).catch(err => {
            res.status(200).json({ result: false, message: err });
        });
    });

    app.put('/documents/:id', auth, (req, res) => {
        Document(req).update(req.body, { where: { id: req.params.id } }).then(data => {
            if (data[0] == 1) {
                res.status(200).json({ result: true, message: 'Documento Actualizado' });
            } else {
                res.status(200).json({ result: true, message: 'Sin Cambios' });
            }
        }).catch(err => {
            res.status(200).json({ result: false, message: err });
        });
    });

    app.delete('/documents/:id', auth, (req, res) => {
        Document(req).destroy({ where: { id: req.params.id } }).then(data => {
            if (data == 1) {
                let folder = `${dirname}/${req}/documents/${req.params.id}`;
                if (fs.existsSync(folder)) {
                    fs.rmSync(folder, { recursive: true });
                }
                res.status(200).json({ result: true, message: 'Documento Eliminado' });
            } else {
                res.status(200).json({ result: false, message: 'Sin Cambios' });
            }
        }).catch(err => {
            res.status(200).json({ result: false, message: err });
        });
    });

} export default documentRoute;