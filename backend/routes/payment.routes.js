const express = require('express')
const routes = express.Router()
const paymentController = require('../controllers/payment/payment.controller')

routes.post('/create',paymentController.createPayment)

module.exports = routes