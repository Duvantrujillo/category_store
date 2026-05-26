const express = require('express')
const routes = express.Router()
const productController = require('../controllers/product/product.controller')
const { route } = require('./users.routes')


routes.post('/create',productController.createProduct)
routes.put('/update/:id',productController.updateProduct)
routes.delete('/delete/:id',productController.deleteProduct)

module.exports = routes