const express = require('express')
const routes = express.Router()
const { rateLimit } = require('express-rate-limit')
const ctrl = require('../controllers/cart/cart-public.controller')

// Generoso para no molestar a un comprador real agregando/editando ítems,
// pero acota creación masiva automatizada de carritos/filas.
const cartWriteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes, intenta más tarde' }
})

routes.post('/public',                        cartWriteLimiter, ctrl.createPublicCart)
routes.get('/public/:uuid',                   ctrl.getPublicCart)
routes.post('/public/:uuid/items',            cartWriteLimiter, ctrl.addPublicCartItem)
routes.put('/public/:uuid/items/:variantId',  cartWriteLimiter, ctrl.updatePublicCartItem)
routes.delete('/public/:uuid/items/:variantId', cartWriteLimiter, ctrl.removePublicCartItem)

routes.post('/public/:uuid/bundles',            cartWriteLimiter, ctrl.addPublicBundleItem)
routes.put('/public/:uuid/bundles/:bundleId',   cartWriteLimiter, ctrl.updatePublicBundleItem)
routes.delete('/public/:uuid/bundles/:bundleId', cartWriteLimiter, ctrl.removePublicBundleItem)

module.exports = routes
