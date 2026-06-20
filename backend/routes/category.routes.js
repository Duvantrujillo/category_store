const express = require('express')
const router = express.Router()
const multer = require('multer')
const categoryController = require('../controllers/category/category.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/category')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage })

router.get('/active',       requirePermission('categories.view'),   categoryController.activeCategory)
router.get('/all',          requirePermission('categories.view'),   categoryController.allCategory)
router.post('/create',      requirePermission('categories.create'), upload.single('image'), categoryController.createCategory)
router.put('/update/:id',   requirePermission('categories.update'), upload.single('image'), categoryController.updateCategory)
router.delete('/delete/:id',requirePermission('categories.delete'), categoryController.deleteCategory)

module.exports = router
