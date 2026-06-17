const express = require('express')
const router = express.Router()
const shipmentController = require('../controllers/shipment/shipment.controller')


router.get('/all', shipmentController.allShipment)
router.get('/:id/history', shipmentController.getShipmentHistory)
router.put('/:id', shipmentController.updateShipment)

module.exports = router