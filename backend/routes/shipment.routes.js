const express = require('express')
const router = express.Router()
const shipmentController = require('../controllers/shipment/shipment.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

router.get('/all',          requirePermission('orders.view'),      shipmentController.allShipment)
router.get('/:id/history',  requirePermission('orders.view'),      shipmentController.getShipmentHistory)
router.put('/:id',          requirePermission('shipments.update'), shipmentController.updateShipment)

module.exports = router
