const express = require('express')
const router = express.Router()
const returnRequestController =  require('../controllers/return-request/return_request.controller')



router.post('/create',returnRequestController.createreturnRequest)


module.exports = router