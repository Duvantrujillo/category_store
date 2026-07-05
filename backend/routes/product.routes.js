const express = require('express')
const routes = express.Router()
const productController = require('../controllers/product/product.controller')
const { requirePermission } = require('../middlewares/permission.middleware')
const multer = require('multer')
const path = require('path')

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/product'),
  filename:    (req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, Date.now() + '-' + safeName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true)
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Formato inválido'))
  }
})

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ message: 'La imagen no puede superar 5 MB' })
    return res.status(400).json({ message: 'Formato inválido. Solo jpg, jpeg, png o webp' })
  }
  next(err)
}

routes.get('/all',          requirePermission('products.view'),    productController.allProduct)
routes.get('/search',       requirePermission('products.view'),    productController.searchProduct)
routes.post('/create',      requirePermission('products.create'),  upload.single('mainImage'), handleUploadError, productController.createProduct)
routes.put('/update/:id',   requirePermission('products.update'),  upload.single('mainImage'), handleUploadError, productController.updateProduct)
routes.delete('/delete/:id',requirePermission('products.delete'),  productController.deleteProduct)

module.exports = routes
