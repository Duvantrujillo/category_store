const express = require('express')
const routes = express.Router()
const productController = require('../controllers/product/product.controller')
const { route } = require('./users.routes')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, File, cb) => {
        cb(null, 'uploads/product')
    },
    filename: (req, file, cb) => {
        // Evitar conflictos de nombre con timestamp
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({storage})

routes.post('/create', upload.single('mainImage'),productController.createProduct)
routes.put('/update/:id', upload.single('mainImage'), productController.updateProduct)
routes.delete('/delete/:id', productController.deleteProduct)
routes.get('/all', productController.allProduct)


module.exports = routes