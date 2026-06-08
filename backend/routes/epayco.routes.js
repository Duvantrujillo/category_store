const express = require('express')
const routes = express.Router()
const epaycoController =  require('../controllers/payment/epayco.controller')


routes.post('/create',epaycoController.createPayment)


module.exports = routes