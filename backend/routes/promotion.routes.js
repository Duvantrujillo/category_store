const express = require('express')
const router = express.Router()
const promotionController = require('../controllers/promotion/promotion.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

router.get('/all',           requirePermission('promotions.view'),   promotionController.allPromotion)
router.get('/search',        requirePermission('promotions.view'),   promotionController.searchPromotion)
router.post('/create',       requirePermission('promotions.create'), promotionController.createPromotion)
router.put('/update/:id',    requirePermission('promotions.update'), promotionController.updatePromotion)
router.delete('/delete/:id', requirePermission('promotions.delete'), promotionController.deletePromotion)

module.exports = router
