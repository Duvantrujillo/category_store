const express = require('express')
const router = express.Router()
const multer = require('multer')
const branchController = require('../controllers/brand/brand.controller')

// Configuración de multer para guardar archivos en 'uploads/'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/brand') // Carpeta donde se guardan los archivos
  },
  filename: (req, file, cb) => {
    // Evitar conflictos de nombre con timestamp
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage })

// Rutas
// ✅ Subir imagen al crear marca
router.post('/create', upload.single('logo'), branchController.createBrand)

// Opcional: si quieres permitir cambiar logo al actualizar
router.put('/update/:id', upload.single('logo'), branchController.updateBrand)

router.delete('/delete/:id', branchController.deleteBrand)
router.get('/all', branchController.allBrand)

module.exports = router