const express = require('express')
const router = express.Router()
const multer = require('multer')
const branchController = require('../controllers/brand/brand.controller')
const { requirePermission } = require('../middlewares/permission.middleware')
const { safeFilename } = require('../utils/safe-upload')

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/brand')
  },
  filename: safeFilename
})

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true)
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Formato inválido'))
  }
})

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ message: 'El logo no puede superar 300 KB' })
    return res.status(400).json({ message: 'Formato inválido. Solo jpg, jpeg, png o webp' })
  }
  next(err)
}

router.get('/public',       branchController.getPublicBrands)
router.get('/all',          requirePermission('brands.view'),   branchController.allBrand)
router.get('/search',       requirePermission('brands.view'),   branchController.searchBrand)
router.post('/create',      requirePermission('brands.create'), upload.single('logo'), handleUploadError, branchController.createBrand)
router.put('/update/:id',   requirePermission('brands.update'), upload.single('logo'), handleUploadError, branchController.updateBrand)
router.delete('/delete/:id',requirePermission('brands.delete'), branchController.deleteBrand)

module.exports = router
