const express = require('express')
const routes  = express.Router()
const ctrl    = require('../controllers/wishlist/wishlist-public.controller')

routes.get('/public/:cartUuid',                      ctrl.getPublicWishlist)
routes.post('/public/:cartUuid/items',               ctrl.addPublicWishlistItem)
routes.delete('/public/:cartUuid/items/:variantId',  ctrl.removePublicWishlistItem)

module.exports = routes
