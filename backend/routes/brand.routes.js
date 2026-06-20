const express = require('express')
const router = express.Router()
const multer = require('multer')
const branchController = require('../controllers/brand/brand.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/brand')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage })

router.get('/all',          requirePermission('brands.view'),   branchController.allBrand)
router.get('/search',       requirePermission('brands.view'),   branchController.searchBrand)
router.post('/create',      requirePermission('brands.create'), upload.single('logo'), branchController.createBrand)
router.put('/update/:id',   requirePermission('brands.update'), upload.single('logo'), branchController.updateBrand)
router.delete('/delete/:id',requirePermission('brands.delete'), branchController.deleteBrand)

module.exports = router
