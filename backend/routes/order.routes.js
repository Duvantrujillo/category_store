const express = require('express')
const routes = express.Router()
const ordenController = require('../controllers/order/order.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

// Crear orden es acción del cliente — no requiere permiso de admin
routes.post('/create',    ordenController.createOrder)

// Vistas de admin
routes.get('/all',        requirePermission('orders.view'),   ordenController.allOrder)
routes.get('/search',     requirePermission('orders.view'),   ordenController.searchOrder)
routes.get('/by-date',    requirePermission('orders.view'),   ordenController.filterOrderByDate)

module.exports = routes
