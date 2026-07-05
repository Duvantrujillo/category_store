const express = require('express')
const routes = express.Router()
const { rateLimit } = require('express-rate-limit')
const webhookController = require('../controllers/payment/webhook.controller')

// Generoso para no interferir con reintentos legítimos de ePayco, pero
// acota el flood de peticiones inválidas/maliciosas.
const webhookLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes' }
})

routes.post(
    '/create',
    webhookLimiter,
    webhookController.epaycoWebhook
)


module.exports = routes
