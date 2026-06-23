const express = require('express')
const routes = express.Router()
const ctrl = require('../controllers/cart/cart-public.controller')

routes.post('/public',                        ctrl.createPublicCart)
routes.get('/public/:uuid',                   ctrl.getPublicCart)
routes.post('/public/:uuid/items',            ctrl.addPublicCartItem)
routes.put('/public/:uuid/items/:variantId',  ctrl.updatePublicCartItem)
routes.delete('/public/:uuid/items/:variantId', ctrl.removePublicCartItem)

module.exports = routes
