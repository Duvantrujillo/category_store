const express = require('express')
const router = express.Router()
const refundController = require('../controllers/refund/refund.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

router.post('/create',  requirePermission('refunds.create'),  refundController.createRefund)
router.post('/process', requirePermission('refunds.process'), refundController.processRefund)

module.exports = router