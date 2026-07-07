const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const productBundleController = require('../controllers/product-bundle/product_bundle.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

const UPLOAD_DIR = path.join(__dirname, '../uploads/product-bundle')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, Date.now() + '-' + safeName)
  }
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
      return res.status(400).json({ message: 'La imagen no puede superar 300 KB' })
    return res.status(400).json({ message: 'Formato inválido. Solo jpg, jpeg, png o webp' })
  }
  next(err)
}

router.get('/public',           productBundleController.getPublicProductBundles)
router.get('/all',              requirePermission('bundles.view'),   productBundleController.allProductBundle)
router.get('/search',           requirePermission('bundles.view'),   productBundleController.searchProductBundle)
router.post('/create',          requirePermission('bundles.create'), upload.single('mainImage'), handleUploadError, productBundleController.createProductBundle)
router.put('/update/:id',       requirePermission('bundles.update'), upload.single('mainImage'), handleUploadError, productBundleController.updateProductBundle)
router.delete('/delete/:id',    requirePermission('bundles.delete'), productBundleController.deleteProductBundle)

module.exports = router
