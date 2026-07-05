const express = require('express')
const router = express.Router()
const { rateLimit } = require('express-rate-limit')
const discountCodeController = require('../controllers/discount-code/discount_code.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

// Limita intentos de adivinar códigos de cupón válidos (endpoint público sin auth)
const validateCouponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiados intentos, intenta más tarde' }
})

// Validar cupón en checkout — acción del cliente, no requiere permiso de admin
router.post('/validate', validateCouponLimiter, discountCodeController.validateDiscountCode)

router.get('/all',          requirePermission('discount-codes.view'),   discountCodeController.allDiscountCode)
router.get('/search',       requirePermission('discount-codes.view'),   discountCodeController.searchDiscountCode)
router.post('/create',      requirePermission('discount-codes.create'), discountCodeController.createDiscountCode)
router.put('/update/:id',   requirePermission('discount-codes.update'), discountCodeController.updateDiscountCode)
router.delete('/delete/:id',requirePermission('discount-codes.delete'), discountCodeController.deleteDiscountCode)

module.exports = router
