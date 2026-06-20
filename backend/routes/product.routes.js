const express = require('express')
const routes = express.Router()
const productController = require('../controllers/product/product.controller')
const { requirePermission } = require('../middlewares/permission.middleware')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/product'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
})
const upload = multer({ storage })

routes.get('/all',          requirePermission('products.view'),    productController.allProduct)
routes.get('/search',       requirePermission('products.view'),    productController.searchProduct)
routes.post('/create',      requirePermission('products.create'),  upload.single('mainImage'), productController.createProduct)
routes.put('/update/:id',   requirePermission('products.update'),  upload.single('mainImage'), productController.updateProduct)
routes.delete('/delete/:id',requirePermission('products.delete'),  productController.deleteProduct)

module.exports = routes
