const express = require('express')
const router = express.Router()


const branchController = require('../controllers/brand/brand.controller')

router.post('/create',branchController.createBrand)

router.put('/update/:id',branchController.updateBrand)

router.delete('/delete/:id', branchController.deleteBrand)

router.get('/all', branchController.allBrand)


module.exports = router