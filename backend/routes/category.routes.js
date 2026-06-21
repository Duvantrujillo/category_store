const express = require('express')
const router = express.Router()
const multer = require('multer')
const categoryController = require('../controllers/category/category.controller')

const { requirePermission } = require('../middlewares/permission.middleware')

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/category')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true)
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Formato inválido. Solo jpg, png o webp'))
  }
})

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: 'La imagen no puede superar 300 KB' })
    return res.status(400).json({ error: 'Formato inválido. Solo jpg, jpeg, png o webp' })
  }
  next(err)
}

router.get('/active',       requirePermission('categories.view'),   categoryController.activeCategory)
router.get('/search',       requirePermission('categories.view'),   categoryController.searchCategory)
router.get('/all',          requirePermission('categories.view'),   categoryController.allCategory)
router.post('/create',      requirePermission('categories.create'), upload.single('image'), handleUploadError, categoryController.createCategory)
router.put('/update/:id',   requirePermission('categories.update'), upload.single('image'), handleUploadError, categoryController.updateCategory)
router.delete('/delete/:id',requirePermission('categories.delete'), categoryController.deleteCategory)

module.exports = router
