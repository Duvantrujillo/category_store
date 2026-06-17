const express = require('express')
const routes = express.Router()
const paymentController = require('../controllers/payment/payment.controller')

routes.post('/create', paymentController.createPayment)
routes.get('/methods', paymentController.getPaymentMethods)

module.exports = routes