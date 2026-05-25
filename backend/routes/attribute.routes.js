const express = require('express')
const router = express.Router()
const { PrismaClient } = require("@prisma/client")
const attributeController = require ('../controllers/attribute/attribute.controller')
const prisma = new PrismaClient()

router.post('/create', attributeController.createAttribute)
router.put('/update/:id',attributeController.updateAttribute)
router.delete('/delete/:id', attributeController.deleteAttribute)
router.get('/all', attributeController.allAttribute)





module.exports = router