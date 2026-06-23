const express = require('express');
const app = express();
const cors = require("cors");
const path = require("path");
require('dotenv').config();

const { authMiddleware } = require('./middlewares/auth.middleware');

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

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
const shipmentRouter = require('./routes/shipment.routes.js')
const dashboardRouter = require('./routes/dashboard.routes.js')
const notificationRouter = require('./routes/notification.routes.js')
const reportRouter       = require('./routes/report.routes.js')
const searchRouter       = require('./routes/search.routes.js')
const permissionRouter       = require('./routes/permission.routes.js')
const paymentMethodRouter    = require('./routes/payment-method.routes.js')

/*
|--------------------------------------------------------------------------
| AUTH GUARD
| El webhook debe estar antes del guard porque ePayco lo llama sin token.
| Las rutas de login/registro/formulario de cliente son públicas.
|--------------------------------------------------------------------------
*/

// ePayco llama este endpoint sin token — debe ser completamente público
app.use('/webhook', webhookRouter)

// Carrito anónimo (visitantes sin cuenta)
const publicCartRouter = require('./routes/cart-public.routes.js')
app.use('/cart', publicCartRouter)

// Detalle de variante individual (sin auth)
const { getPublicVariantById } = require('./controllers/product-variant/product_variant.controller')
app.get('/product-variant/public/:id', getPublicVariantById)

// Rutas públicas (no requieren sesión)
const PUBLIC_ROUTES = new Set([
  'POST /user/create',
  'POST /user/login',
  'POST /form/create',
  'GET /product-variant/public',
  'GET /category/public',
  'GET /brand/public',
  'GET /search/public',
])

app.use((req, res, next) => {
  if (PUBLIC_ROUTES.has(`${req.method} ${req.path}`)) return next()
  return authMiddleware(req, res, next)
})

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

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
app.use('/epayco',epaycoRouter)
app.use('/return-request',returnRequestRouter)
app.use('/return-item',returnItemRouter)
app.use('/refund',refundRouter)
app.use('/shipment',shipmentRouter)
app.use('/dashboard',dashboardRouter)
app.use('/notification',notificationRouter)
app.use('/report',      reportRouter)
app.use('/search',      searchRouter)
app.use('/permission',  permissionRouter)
app.use('/payment-method', paymentMethodRouter)

/*
|--------------------------------------------------------------------------
| SERVER
|--------------------------------------------------------------------------
*/

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo`);
});

/*
|--------------------------------------------------------------------------
| CRON: LIBERAR RESERVAS DE STOCK EXPIRADAS
| Cancela órdenes PENDING sin pago después de 30 minutos y libera reservedStock.
| Sin esto, un usuario que abandona el pago bloquea el stock indefinidamente.
|--------------------------------------------------------------------------
*/
const { releaseExpiredReservations } = require('./controllers/order/order.controller')
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000 // cada 15 minutos
setInterval(() => {
  releaseExpiredReservations().catch(err => console.error('Error en cleanup de reservas:', err))
}, CLEANUP_INTERVAL_MS)
