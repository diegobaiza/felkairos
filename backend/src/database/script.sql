CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(60) NOT NULL,
  `username` varchar(60) NOT NULL,
  `password` varchar(60) NOT NULL,
  `color` varchar(60) NOT NULL,
  `access` tinyint(1) NOT NULL
);

INSERT INTO `users` VALUES (1, 'Super Administrador', 'admin', 'sha1$9d7e2064$1$89e707b9d8f6f25e452146ad4f2b79a544fd1da3', '#3978af', 1);

CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(60) NOT NULL,
  `nit` varchar(60) NOT NULL,
  `email` varchar(60) NULL DEFAULT '',
  `doc` varchar(60) NOT NULL
);

INSERT INTO `customers` VALUES (1, 'Consumidor Final', 'CF', '', 'NIT');

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(60) NOT NULL,
  `nit` varchar(60) NOT NULL,
  `email` varchar(60) NULL DEFAULT '',
  `doc` varchar(60) NOT NULL
);

INSERT INTO `suppliers` VALUES (1, 'Consumidor Final', 'CF', '', 'NIT');

CREATE TABLE `branches` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(60) NOT NULL,
  `number` int(11) NOT NULL,
  `address` varchar(60) NOT NULL,
  `phone` varchar(60) NOT NULL
);

INSERT INTO `branches` VALUES (1, 'Sucursal 1', 1, 'Guatemala', '0000-0000');

CREATE TABLE `warehouses` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(60) NOT NULL,
  `number` int(11) NOT NULL,
  `address` varchar(60) NOT NULL,
  `phone` varchar(60) NOT NULL,
  `branchId` int(11) NOT NULL,
  CONSTRAINT `fk_warehouses_branches` FOREIGN KEY (`branchId`) REFERENCES `branches` (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

INSERT INTO `warehouses` VALUES (1, 'Bodega 1', 1, 'Guatemala', '0000-0000', 1);

CREATE TABLE `units` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(60) NOT NULL,
  `symbol` varchar(60) NOT NULL
);

INSERT INTO `units` VALUES (1, 'Unidad', 'ud');
INSERT INTO `units` VALUES (2, 'Onza', 'oz');
INSERT INTO `units` VALUES (3, 'Gramo', 'g');
INSERT INTO `units` VALUES (4, 'Libra', 'lb');

CREATE TABLE `attributes` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(60) NOT NULL,
  `symbol` varchar(60) NOT NULL
);

INSERT INTO `attributes` VALUES (1, 'Talla XS', 'XS');
INSERT INTO `attributes` VALUES (2, 'Talla S', 'S');
INSERT INTO `attributes` VALUES (3, 'Talla M', 'M');
INSERT INTO `attributes` VALUES (4, 'Talla L', 'L');
INSERT INTO `attributes` VALUES (5, 'Talla XL', 'XL');

CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `image` varchar(100) NULL,
  `sku` varchar(60) NOT NULL,
  `type` varchar(60) NOT NULL,
  `cost` decimal(10, 2) NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `unitId` int(11) NOT NULL,
  `equivalence` decimal(10, 2) NOT NULL,
  `entryUnitId` int(11) NOT NULL,
  CONSTRAINT `fk_products_units` FOREIGN KEY (`unitId`) REFERENCES `units` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_products_entry_units` FOREIGN KEY (`entryUnitId`) REFERENCES `units` (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE `variations` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `productId` int(11) NOT NULL,
  `attributeId` int(11) NOT NULL,
  CONSTRAINT `fk_variations_products` FOREIGN KEY (`productId`) REFERENCES `products` (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_variations_attributes` FOREIGN KEY (`attributeId`) REFERENCES `attributes` (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE `recipes` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `quantity` decimal(10, 2) NOT NULL,
  `productId` int(11) NOT NULL,
  `variationId` int(11) NULL,
  `productRecipeId` int(11) NOT NULL,
  CONSTRAINT `fk_recipes_products` FOREIGN KEY (`productId`) REFERENCES `products` (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recipes_variations` FOREIGN KEY (`variationId`) REFERENCES `variations` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_recipes_products_recipes` FOREIGN KEY (`productRecipeId`) REFERENCES `products` (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE `typedocuments`  (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(60) NOT NULL,
  `inventory` varchar(60) NOT NULL,
  `certification` tinyint(1) NOT NULL,
  `note` tinyint(1) NOT NULL,
  `products` tinyint(1) NOT NULL,
  `branch` tinyint(1) NOT NULL,
  `warehouse` tinyint(1) NOT NULL,
  `customer` tinyint(1) NOT NULL,
  `supplier` tinyint(1) NOT NULL,
  `currency` tinyint(1) NOT NULL,
  `details` tinyint(1) NOT NULL,
  `operation` tinyint(1) NOT NULL,
  `payment` tinyint(1) NOT NULL,
  `abonos` tinyint(1) NOT NULL,
  `totals` tinyint(1) NOT NULL,
  `coupons` tinyint(1) NOT NULL
);

INSERT INTO `typedocuments` VALUES (1, 'COMPRA', 'ENTRADA', 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1);
INSERT INTO `typedocuments` VALUES (2, 'FACTURA', 'SALIDA', 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1);
INSERT INTO `typedocuments` VALUES (3, 'FACTURA CAMBIARIA', 'SALIDA', 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1);
INSERT INTO `typedocuments` VALUES (4, 'NOTA DE CREDITO', 'NOTA', 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0);
INSERT INTO `typedocuments` VALUES (5, 'NOTA DE DEBITO', 'NOTA', 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0);
INSERT INTO `typedocuments` VALUES (6, 'NOTA DE ABONO', 'NOTA', 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0);
INSERT INTO `typedocuments` VALUES (7, 'FACTURA ESPECIAL', 'ENTRADA', 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1);
INSERT INTO `typedocuments` VALUES (8, 'RECIBO', 'SALIDA', 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1);
INSERT INTO `typedocuments` VALUES (9, 'RECIBO POR DONACION', 'SALIDA', 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1);
INSERT INTO `typedocuments` VALUES (10, 'CARGA INVENTARIO', 'ENTRADA', 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0);
INSERT INTO `typedocuments` VALUES (11, 'DESCARGA INVENTARIO', 'SALIDA', 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0);
INSERT INTO `typedocuments` VALUES (12, 'TRASLADO', 'SALIDA', 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0);
INSERT INTO `typedocuments` VALUES (13, 'ABONO', 'ABONO', 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0);

CREATE TABLE `documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(60) NOT NULL,
  `image` varchar(100) NULL,
  `serie` varchar(60) NOT NULL,
  `correlative` varchar(60) NOT NULL,
  `primaryColor` varchar(100) NULL,
  `secondaryColor` varchar(100) NULL,
  `typeDocumentId` int(11) NOT NULL,
  `branchId` int(11) NOT NULL,
  `warehouseId` int(11) NULL,
  CONSTRAINT `fk_documents_typedocuments` FOREIGN KEY (`typeDocumentId`) REFERENCES `typedocuments` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_documents_branches` FOREIGN KEY (`branchId`) REFERENCES `branches` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_documents_warehouses` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses` (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE `operations` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `serie` varchar(60) NOT NULL,
  `correlative` varchar(60) NOT NULL,
  `date` datetime NOT NULL,
  `nit` varchar(60) NULL,
  `total` decimal(10, 2) NOT NULL,
  `subTotal` decimal(10, 2) NOT NULL,
  `iva` decimal(10, 2) NOT NULL,
  `isr` decimal(10, 2) NULL,
  `discount` decimal(10, 2) NOT NULL,
  `exchange` decimal(10, 2) NOT NULL,
  `turned` decimal(10, 2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `payment` varchar(10) NOT NULL,
  `observations` varchar(100) NULL,
  `autorizacionFel` varchar(100) NULL,
  `serieFel` varchar(100) NULL,
  `numberFel` varchar(100) NULL,
  `status` varchar(20) NOT NULL,
  `userId` int(11) NOT NULL,
  `customerId` int(11) NULL,
  `supplierId` int(11) NULL,
  `branchId` int(11) NOT NULL,
  `warehouseId` int(11) NULL,
  `documentId` int(11) NOT NULL,
  `operationId` int(11) NULL,
  CONSTRAINT `fk_operations_users` FOREIGN KEY (`userId`) REFERENCES `users` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_operations_customers` FOREIGN KEY (`customerId`) REFERENCES `customers` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_operations_suppliers` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_operations_branches` FOREIGN KEY (`branchId`) REFERENCES `branches` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_operations_warehouses` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_operations_documents` FOREIGN KEY (`documentId`) REFERENCES `documents` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_operations_operations` FOREIGN KEY (`operationId`) REFERENCES `operations` (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE `detailoperations` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `quantity` decimal(10, 2) NOT NULL,
  `cost` decimal(10, 2) NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `discount` decimal(10, 2) NOT NULL,
  `description` varchar(256) NOT NULL,
  `subTotal` decimal(10, 2) NOT NULL,
  `productId` int(11) NOT NULL,
  `operationId` int(11) NOT NULL,
  CONSTRAINT `fk_detailOperations_products` FOREIGN KEY (`productId`) REFERENCES `products` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_detailOperations_operations` FOREIGN KEY (`operationId`) REFERENCES `operations` (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `paymentoperations` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `type` varchar(60) NOT NULL,
  `auth` varchar(60) NULL,
  `total` decimal(10, 2) NOT NULL,
  `operationId` int(11) NOT NULL,
  CONSTRAINT `fk_paymentOperations_operations` FOREIGN KEY (`operationId`) REFERENCES `operations` (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `kardex` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `date` datetime NOT NULL,
  `type` varchar(60) NOT NULL,
  `quantity` decimal(10, 2) NOT NULL,
  `stock` decimal(10, 2) NOT NULL,
  `cost` decimal(10, 2) NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `productId` int(11) NOT NULL,
  `variationId` int(11) NULL,
  `branchId` int(11) NOT NULL,
  `warehouseId` int(11) NULL,
  `operationId` int(11) NULL,
  CONSTRAINT `fk_kardex_products` FOREIGN KEY (`productId`) REFERENCES `products` (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_kardex_variations` FOREIGN KEY (`variationId`) REFERENCES `variations` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_kardex_branches` FOREIGN KEY (`branchId`) REFERENCES `branches` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_kardex_warehouses` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses` (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_kardex_operations` FOREIGN KEY (`operationId`) REFERENCES `operations` (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `costs` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `date` datetime NOT NULL,
  `cost` decimal(10, 2) NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `productId` int(11) NOT NULL,
  `operationId` int(11) NOT NULL,
  CONSTRAINT `fk_costs_products` FOREIGN KEY (`productId`) REFERENCES `products` (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_costs_operations` FOREIGN KEY (`operationId`) REFERENCES `operations` (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `amount` decimal(10, 2) NOT NULL
);

INSERT INTO `coupons` VALUES (1, 'Cupon Mayorista', '1234', 25);