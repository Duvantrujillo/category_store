const express = require('express')
const routes = express.Router()
const epaycoController =  require('../controllers/payment/epayco.controller')
const { requireSuperAdmin } = require('../middlewares/permission.middleware')

// Endpoint de pruebas de integración (tarjeta sandbox hardcodeada) — no es
// parte del flujo real de checkout (ver order.controller.js/payment.controller.js
// + el widget de ePayco en el frontend). Restringido a super_admin para que
// no quede alcanzable por cualquier cuenta autenticada.
routes.post('/create', requireSuperAdmin, epaycoController.createPayment)


module.exports = routes