const express = require('express');
const app = express();
const cors = require("cors");
const path = require("path");
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| PUBLIC FILES
|--------------------------------------------------------------------------
*/

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

const userRouter = require('./routes/users.routes.js');
const formRouter = require('./routes/form.routes.js');
const categoryRouter = require('./routes/category.routes.js');
const attributeRouter = require('./routes/attribute.routes.js');
const attributeValuesRouter = require('./routes/attribute-value.routes.js');
const branchRouter = require('./routes/brand.routes.js');
const productRouter = require('./routes/product.routes.js');
const productVariantRouter = require("./routes/product-variant.routes.js");
const productVariantAttributeRouter = require('./routes/product-variant-attribute.routes.js');
const cartRouter = require('./routes/cart.routes.js')
const cartItemRouter = require('./routes/cart-item.routes.js')
const orderRouter = require('./routes/order.routes.js')
const paymentRouter = require('./routes/payment.routes.js')
const webhookRouter = require('./routes/webhook.routes.js')
const epaycoRouter = require('./routes/epayco.routes.js')
const returnRequestRouter = require('./routes/return-request.routes.js')
const returnItemRouter = require('./routes/return-item.routes.js')
const refundRouter = require('./routes/refund.routes.js')









app.use('/user', userRouter);
app.use('/form', formRouter);
app.use('/category', categoryRouter);
app.use('/attribute', attributeRouter);
app.use('/attribute-values', attributeValuesRouter);
app.use('/brand', branchRouter);
app.use('/product', productRouter);
app.use('/product-variant', productVariantRouter);
app.use('/product-variant-attribute', productVariantAttributeRouter);
app.use('/cart',cartRouter)
app.use('/cart-item',cartItemRouter)
app.use('/order',orderRouter)
app.use('/payment',paymentRouter)
app.use('/webhook',webhookRouter)
app.use('/epayco',epaycoRouter)
app.use('/return-request',returnRequestRouter)
app.use('/return-item',returnItemRouter)
app.use('/refund',refundRouter)



/*
|--------------------------------------------------------------------------
| SERVER
|--------------------------------------------------------------------------
*/

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo`);
});