const express = require('express')
const router = express.Router()
const purchaseGiftController = require('../controllers/purchase-gift/purchase-gift.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

router.get('/all',           requirePermission('purchase-gifts.view'),   purchaseGiftController.allPurchaseGift)
router.get('/search',        requirePermission('purchase-gifts.view'),   purchaseGiftController.searchPurchaseGift)
router.post('/create',       requirePermission('purchase-gifts.create'), purchaseGiftController.createPurchaseGift)
router.put('/update/:id',    requirePermission('purchase-gifts.update'), purchaseGiftController.updatePurchaseGift)
router.delete('/delete/:id', requirePermission('purchase-gifts.delete'), purchaseGiftController.deletePurchaseGift)

module.exports = router
