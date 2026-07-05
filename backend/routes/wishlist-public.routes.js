const express = require('express')
const routes  = express.Router()
const { rateLimit } = require('express-rate-limit')
const ctrl    = require('../controllers/wishlist/wishlist-public.controller')

// Generoso para no molestar el uso real (agregar/quitar favoritos), pero
// acota creación masiva automatizada de filas.
const wishlistWriteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes, intenta más tarde' }
})

routes.get('/public/:cartUuid',                      ctrl.getPublicWishlist)
routes.post('/public/:cartUuid/items',               wishlistWriteLimiter, ctrl.addPublicWishlistItem)
routes.delete('/public/:cartUuid/items/:variantId',  wishlistWriteLimiter, ctrl.removePublicWishlistItem)

module.exports = routes
