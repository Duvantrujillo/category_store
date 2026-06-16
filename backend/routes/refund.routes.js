const express =  require('express')
const router = express.Router()
const refundController = require('../controllers/refund/refund.controller')

router.post('/create',refundController.createRefund)
router.post('/process',refundController.processRefund)


module.exports= router