const express = require('express');
const routes = express.Router();
const productVariantController = require("../controllers/product-variant/product_variant.controller");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

/**
 * Storage dinámico para variantes
 * Primero subimos a "temp" porque todavía no tenemos variant.id
 * Luego en el controlador moveremos a la carpeta final
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempPath = path.join(__dirname, '../../uploads/product-variant/temp');
    fs.mkdirSync(tempPath, { recursive: true });
    cb(null, tempPath);
  },
  filename: (req, file, cb) => {
    // Evitar conflictos con timestamp
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

/**
 * Rutas para variantes
 * upload.array('images', 5) -> permitimos hasta 5 imágenes
 */
routes.post("/create", upload.array('images', 5), productVariantController.createProductVariant);
routes.put("/update/:id", upload.array('images', 5), productVariantController.updateProductVariant);
routes.delete("/delete/:id", productVariantController.deleteProductVariant);
routes.get("/all", productVariantController.allProductVariant);

module.exports = routes;