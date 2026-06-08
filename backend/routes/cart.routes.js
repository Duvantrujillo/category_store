const express = require('express')
const routes = express.Router()
const cardController = require('../controllers/cart/cart.controller')


routes.post('/create',cardController.createCart)








module.exports = routes