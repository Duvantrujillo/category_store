const express = require("express")
const routes = express.Router()
const productVariantController = require("../controllers/product-variant/product_variant.controller")

routes.post("/create",productVariantController.createProductVariant)
routes.put("/update/:id",productVariantController.updateProductVariant)
routes.delete("/delete/:id",productVariantController.deleteProductVariant)
routes.get("/all",productVariantController.allProductVariant)


module.exports = routes