const express = require('express')
const routes = express.Router()
const { rateLimit } = require('express-rate-limit')
const paymentController = require('../controllers/payment/payment.controller')

// Endpoints públicos sin sesión — limitar intentos de enumeración/abuso.
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes, intenta más tarde' }
})

routes.post('/create', paymentLimiter, paymentController.createPayment)
routes.get('/methods', paymentController.getPaymentMethods)
routes.get('/verify',  paymentLimiter, paymentController.verifyPayment)

module.exports = routes
