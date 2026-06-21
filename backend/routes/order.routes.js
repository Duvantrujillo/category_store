const express = require('express')
const routes = express.Router()
const { rateLimit } = require('express-rate-limit')
const ordenController = require('../controllers/order/order.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes, intenta más tarde' }
})

// Crear orden es acción del cliente — no requiere permiso de admin
routes.post('/create', createOrderLimiter, ordenController.createOrder)

// Vistas de admin
routes.get('/all',        requirePermission('orders.view'),   ordenController.allOrder)
routes.get('/search',     requirePermission('orders.view'),   ordenController.searchOrder)
routes.get('/by-date',    requirePermission('orders.view'),   ordenController.filterOrderByDate)

module.exports = routes
