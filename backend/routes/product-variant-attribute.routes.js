const express = require("express")
const routes = express.Router()
const productVariantAttributeController = require("../controllers/product-variant-attribute/product_variant_attribute.controller")
routes.post("/create",productVariantAttributeController.createproductVarianAtribute)
routes.put('/update/:id',productVariantAttributeController.updateproductVarianAtribute)
routes.delete('/delete/:id',productVariantAttributeController.deleteproductVarianAtribute)
routes.get('/all',productVariantAttributeController.allproductVarianAtribute)
module.exports = routes