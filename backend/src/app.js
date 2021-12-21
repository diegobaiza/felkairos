import express from 'express';
import cors from 'cors';

import companyRoute from './routes/companyRoute.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import branchRoute from './routes/branchRoute.js';
import warehouseRoute from './routes/warehouseRoute.js';
import customerRoute from './routes/customerRoute.js';
import supplierRoute from './routes/supplierRoute.js';
import productRoute from './routes/productRoute.js';
import recipeRoute from './routes/recipeRoute.js';
import variationRoute from './routes/variationRoute.js'
import kardexRoute from './routes/kardexRoute.js';
import typeDocumentRoute from './routes/typeDocumentRoute.js';
import documentRoute from './routes/documentRoute.js';
import operationRoute from './routes/operationRoute.js';
import detailOperationRoute from './routes/detailOperationRoute.js';
import formidableRoute from './routes/formidableRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';
import reportRoute from './routes/reportRoute.js';
import digifactRoute from './routes/digifactRoute.js';
import unitRoute from './routes/unitRoute.js';
import attributeRoute from './routes/attributeRoute.js';
import couponRoute from './routes/couponRoute.js';
import adminRoute from './routes/adminRoute.js';

const app = express();

// Settings
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(cors())
app.use(express.json({ limit: '500mb', extended: true }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(express.text());
app.use('/docs', express.static('src/docs'));

// Routes
companyRoute(app);
authRoute(app);
userRoute(app);
branchRoute(app);
warehouseRoute(app);
customerRoute(app);
supplierRoute(app);
productRoute(app);
recipeRoute(app);
variationRoute(app);
kardexRoute(app);
typeDocumentRoute(app);
documentRoute(app);
operationRoute(app);
detailOperationRoute(app);
dashboardRoute(app);
reportRoute(app);
digifactRoute(app);
unitRoute(app);
attributeRoute(app);
couponRoute(app);
adminRoute(app);

// Formidable
formidableRoute(app);

// Listen
app.listen(app.get('port'), () => {
  console.log(`Server run on port ${app.get('port')}`);
});