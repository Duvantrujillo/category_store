const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const categoryController = require('../controllers/category/category.controller')

const { requirePermission } = require('../middlewares/permission.middleware')
const { safeFilename } = require('../utils/safe-upload')

const UPLOAD_DIR = path.join(__dirname, '../uploads/category')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: safeFilename
})

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 }, // 300 KB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true)
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Formato inválido'))
  }
})

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ message: 'La imagen no puede superar 300 KB' })
    return res.status(400).json({ message: 'Formato inválido. Solo jpg, png o webp' })
  }
  next(err)
}

router.get('/public',       categoryController.getPublicCategories)
router.get('/active',       requirePermission('categories.view'),   categoryController.activeCategory)
router.get('/search',       requirePermission('categories.view'),   categoryController.searchCategory)
router.get('/all',          requirePermission('categories.view'),   categoryController.allCategory)
router.post('/create',      requirePermission('categories.create'), upload.single('image'), handleUploadError, categoryController.createCategory)
router.put('/update/:id',   requirePermission('categories.update'), upload.single('image'), handleUploadError, categoryController.updateCategory)
router.delete('/delete/:id',requirePermission('categories.delete'), categoryController.deleteCategory)

module.exports = router
