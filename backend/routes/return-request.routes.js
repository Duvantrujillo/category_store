const express = require('express')
const router = express.Router()
const returnRequestController = require('../controllers/return-request/return_request.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

router.get('/all',    requirePermission('returns.view'),    returnRequestController.getAllReturnRequests)
router.get('/search', requirePermission('returns.view'),    returnRequestController.searchReturnRequest)
router.post('/create', requirePermission('returns.create'), returnRequestController.createreturnRequest)
router.put('/:id',    requirePermission('returns.approve'), returnRequestController.updateReturnRequest)

module.exports = router
