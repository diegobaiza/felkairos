import pkg from 'express-formidable';
import fs from 'fs';
import moment from 'moment';
import auth from '../middleware/auth.js';
import Company from "../models/company.js";
import Document from '../models/document.js';
import Product from "../models/product.js";

function formidableRoute(app) {

    let dirname = 'src/docs';

    app.post('/documents/image', auth, (req, res) => {
        let url = `/docs/${req.body.database}/documents/${req.body.documentId}`;
        let folder = `${dirname}/${req.body.database}/documents/${req.body.documentId}`;
        if (fs.existsSync(folder)) {
            fs.readdirSync(folder).forEach(name => {
                fs.rmSync(folder + '/' + name);
            });
        } else {
            fs.mkdirSync(folder, { recursive: true });
        }
        let data = `<svg enable-background="new 0 0 32 32" height="512" viewBox="0 0 32 32" width="512"
            xmlns="http://www.w3.org/2000/svg">
            <g id="bg">
            <path fill="${req.body.secondaryColor}"
                d="m26 32h-20c-3.314 0-6-2.686-6-6v-20c0-3.314 2.686-6 6-6h20c3.314 0 6 2.686 6 6v20c0 3.314-2.686 6-6 6z" />
            </g>
            <g id="solid">
            <g>
                <path fill="${req.body.primaryColor}"
                d="m22 9.845c0-1-.802-1.814-1.802-1.83l-8.365-.015c-1.012 0-1.833.821-1.833 1.833v12.333c0 1.013.821 1.834 1.833 1.834h8.333c1.013 0 1.834-.821 1.834-1.833zm-8.08 4.322h-.507c-.779 0-1.413-.634-1.413-1.413 0-.701.505-1.277 1.167-1.395v-.525c0-.276.224-.5.5-.5s.5.224.5.5v.5h.667c.276 0 .5.224.5.5s-.224.5-.5.5h-1.42c-.228 0-.413.186-.413.413 0 .234.186.42.413.42h.507c.779 0 1.413.634 1.413 1.413 0 .701-.505 1.277-1.167 1.395v.525c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-.5h-.667c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h1.42c.228 0 .413-.186.413-.413 0-.235-.185-.42-.413-.42zm5.58 7.833h-7c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h7c.276 0 .5.224.5.5s-.224.5-.5.5zm0-2.667h-7c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h7c.276 0 .5.224.5.5s-.224.5-.5.5zm0-2.666h-2.333c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h2.333c.276 0 .5.224.5.5s-.224.5-.5.5zm.5-3.167c0 .276-.224.5-.5.5h-2.333c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h2.333c.276 0 .5.224.5.5z" />
            </g>
            </g>
        </svg>`
        // let fileName = new Date().getTime() + '.' + req.files.image.name.split('.').pop();
        let fileName = moment().unix() + '.svg';
        fs.writeFileSync(`${folder}/${fileName}`, data);
        Document(req).update({ image: `${url}/${fileName}` }, { where: { id: req.body.documentId } });
        res.status(200).json({ result: true, message: 'Imagen Actualizada', image: `${url}/${fileName}` });
    });

    app.use(pkg());

    app.post('/companies/image', auth, (req, res) => {
        let url = `/docs/${req.fields.database}/logo`;
        let folder = `${dirname}/${req.fields.database}/logo`;
        if (fs.existsSync(folder)) {
            fs.readdirSync(folder).forEach(name => {
                fs.rmSync(folder + '/' + name);
            });
        } else {
            fs.mkdirSync(folder, { recursive: true });
        }
        let data = fs.readFileSync(req.files.image.path);
        // let fileName = new Date().getTime() + '.' + req.files.image.name.split('.').pop();
        let fileName = moment().unix() + '.jpg';
        fs.writeFileSync(`${folder}/${fileName}`, data);
        Company.update({ image: `${url}/${fileName}` }, { where: { database: req.fields.database } });
        res.status(200).json({ result: true, message: 'Imagen Actualizada', image: url + '/' + fileName });
    });

    app.post('/products/image', auth, (req, res) => {
        let url = `/docs/${req.fields.database}/products/${req.fields.productId}`;
        let folder = `${dirname}/${req.fields.database}/products/${req.fields.productId}`;
        if (fs.existsSync(folder)) {
            fs.readdirSync(folder).forEach(name => {
                fs.rmSync(folder + '/' + name);
            });
        } else {
            fs.mkdirSync(folder, { recursive: true });
        }
        let data = fs.readFileSync(req.files.image.path);
        // let fileName = new Date().getTime() + '.' + req.files.image.name.split('.').pop();
        let fileName = moment().unix() + '.jpg';
        fs.writeFileSync(`${folder}/${fileName}`, data);
        Product(req).update({ image: `${url}/${fileName}` }, { where: { id: req.fields.productId } });
        res.status(200).json({ result: true, message: 'Imagen Actualizada', image: `${url}/${fileName}` });
    });

    app.delete('/companies/rm/image/:database', auth, (req, res) => {
        let folder = `${dirname}/${req.params.database}/logo`;
        if (fs.existsSync(folder)) {
            fs.readdirSync(folder).forEach(name => {
                fs.rmSync(folder + '/' + name);
            });
        }
        Company.update({ image: null }, { where: { database: req.params.database } });
        res.status(200).json({ result: true, message: 'Imagen Eliminada' });
    });

    app.delete('/products/rm/image/:database/:id', auth, (req, res) => {
        let folder = `${dirname}/${req.params.database}/products/${req.params.id}`;
        if (fs.existsSync(folder)) {
            fs.rmSync(folder, { recursive: true });
        }
        Product(req).update({ image: null }, { where: { id: req.params.id } });
        res.status(200).json({ result: true, message: 'Imagen Eliminada' });
    });

} export default formidableRoute;