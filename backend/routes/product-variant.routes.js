const express = require('express');
const routes = express.Router();
const productVariantController = require("../controllers/product-variant/product_variant.controller");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { requirePermission } = require('../middlewares/permission.middleware');

/**
 * Storage dinámico para variantes
 * Primero subimos a "temp" porque todavía no tenemos variant.id
 * Luego en el controlador moveremos a la carpeta final
 */
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempPath = path.join(__dirname, '../uploads/product-variant/temp');
    fs.mkdirSync(tempPath, { recursive: true });
    cb(null, tempPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Formato inválido'));
  }
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: 'Cada imagen no puede superar 300 KB' });
    return res.status(400).json({ error: 'Formato inválido. Solo jpg, jpeg, png o webp' });
  }
  next(err);
};

/**
 * Rutas para variantes
 * upload.array('images', 5) -> permitimos hasta 5 imágenes
 */
routes.get("/all",       requirePermission('product-variants.view'),   productVariantController.allProductVariant);
routes.get("/search",    requirePermission('product-variants.view'),   productVariantController.searchSkuBarcode);
routes.post("/create",   requirePermission('product-variants.create'), upload.array('images', 5), handleUploadError, productVariantController.createProductVariant);
routes.put("/update/:id",requirePermission('product-variants.update'), upload.array('images', 5), handleUploadError, productVariantController.updateProductVariant);
routes.delete("/delete/:id", requirePermission('product-variants.delete'), productVariantController.deleteProductVariant);

module.exports = routes;