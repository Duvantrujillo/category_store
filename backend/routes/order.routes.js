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

// Limita intentos de adivinar número de pedido + correo (endpoint público sin auth)
const trackOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, message: 'Demasiadas solicitudes, intenta más tarde' }
})

// Crear orden es acción del cliente — no requiere permiso de admin
routes.post('/create', createOrderLimiter, ordenController.createOrder)

// Consultar pedido — acción pública del cliente, validada por orderNumber + email
routes.get('/track', trackOrderLimiter, ordenController.trackOrder)

// Vistas de admin
routes.get('/all',        requirePermission('orders.view'),   ordenController.allOrder)
routes.get('/search',     requirePermission('orders.view'),   ordenController.searchOrder)
routes.get('/by-date',    requirePermission('orders.view'),   ordenController.filterOrderByDate)

// Acción destructiva e irreversible — permiso separado, no incluido en orders.view
routes.delete('/cancelled', requirePermission('orders.delete'), ordenController.deleteCancelledOrders)

module.exports = routes
