const express = require('express')
const router = express.Router()
const multer = require('multer')
const categoryController = require('../controllers/category/category.controller')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/category')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage })

router.post('/create', upload.single('image'), categoryController.createCategory)
router.put('/update/:id', upload.single('image'), categoryController.updateCategory)
router.delete('/delete/:id', categoryController.deleteCategory)
router.get('/active', categoryController.activeCategory)
router.get('/all', categoryController.allCategory)

module.exports = router
