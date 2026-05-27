const express = require('express');
const router = express.Router();
require('dotenv').config();
const userController = require('../controllers/user/user.controller')


router.post('/create', userController.createUser)

router.post('/login', userController.loginUser)

router.get('/all',userController.allUser)

module.exports = router;