const express = require('express')
const app = express()
const cors = require("cors");
require('dotenv').config();
const Jwt = require('jsonwebtoken')
app.use(cors());
app.use(express.json());

//rutas de los enpoints
const userRouter = require('./routes/users.routes.js')
const formRouter = require('./routes/form.routes.js')
const categoryRouter = require ('./routes/category.routes.js')
const attributeRouter = require('./routes/attribute.routes.js')
const attributeValuesRouter = require('./routes/attribute-values.routes.js')
const branchRouter = require('./routes/brand.routes.js')
const productRouter = require('./routes/product.routes.js')
const productVariantRouter = require("./routes/product-variant.routes.js")
const productVariantAttributeRouter = require('./routes/product-variant-attribute.routes.js')


//RUTAS

app.use('/user', userRouter);
app.use('/form',formRouter);
app.use('/category',categoryRouter);
app.use('/attribute',attributeRouter);
app.use('/attribute-values',attributeValuesRouter);
app.use('/brand',branchRouter);
app.use('/product',productRouter)
app.use('/product-variant',productVariantRouter)
app.use('/product-variant-attribute',productVariantAttributeRouter)


//comprobar si el servidor esta levandado
app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo`);
});

