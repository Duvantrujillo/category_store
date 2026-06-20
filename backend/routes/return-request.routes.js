const express = require('express')
const router = express.Router()
const returnRequestController = require('../controllers/return-request/return_request.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

router.get('/all',    requirePermission('returns.view'),    returnRequestController.getAllReturnRequests)
router.post('/create',                                      returnRequestController.createreturnRequest)
router.put('/:id',    requirePermission('returns.approve'), returnRequestController.updateReturnRequest)

module.exports = router
