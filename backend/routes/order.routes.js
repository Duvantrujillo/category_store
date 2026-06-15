const express = require('express')
const routes = express.Router()
const ordenController = require('../controllers/order/order.controller')

routes.post('/create',ordenController.createOrder)
routes.get('/all',ordenController.allOrder)




module.exports = routes