const express = require("express")
const routes = express.Router()
const productVariantAttributeController = require("../controllers/product-variant-attribute/product_variant_attribute.controller")
const { requirePermission } = require('../middlewares/permission.middleware')

routes.post("/create",   requirePermission('product-variants.update'), productVariantAttributeController.createproductVarianAtribute)
routes.put('/update/:id',requirePermission('product-variants.update'), productVariantAttributeController.updateproductVarianAtribute)
routes.delete('/delete/:id', requirePermission('product-variants.update'), productVariantAttributeController.deleteproductVarianAtribute)
routes.get('/all',       requirePermission('product-variants.view'),   productVariantAttributeController.allproductVarianAtribute)
module.exports = routes