const express = require('express')
const routes = express.Router()
const cartItemsController = require('../controllers/cart-item/cart_item.controller')

routes.post('/create',cartItemsController.createCartItem)

module.exports = routes