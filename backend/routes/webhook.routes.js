const express = require('express')
const routes = express.Router()
const webhookController = require('../controllers/payment/webhook.controller')

routes.post(
    '/create',
    webhookController.epaycoWebhook
)


module.exports = routes