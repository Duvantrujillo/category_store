const express = require('express')
const router = express.Router()

const categoryController = require('../controllers/category/category.controller')
console.log("CATEGORY ROUTES CARGADAS");
router.post('/create', categoryController.createCategory)
router.put('/update/:id', categoryController.updateCategory)
router.delete('/delete/:id', categoryController.deleteCategory)
router.get('/active', categoryController.activeCategory)
router.get('/all',categoryController.allCategory)

module.exports = router;