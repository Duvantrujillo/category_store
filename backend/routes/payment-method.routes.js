const express = require('express')
const routes = express.Router()
const { getActivePaymentMethods } = require('../controllers/payment-method/payment-method.controller')

routes.get('/all', getActivePaymentMethods)

module.exports = routes
