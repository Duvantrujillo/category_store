const express = require('express')
const routes = express.Router()
const {
    getActivePaymentMethods,
    allPaymentMethodsAdmin,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
} = require('../controllers/payment-method/payment-method.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

// Ya en uso por returnApi.js (admin) — sin permiso puntual, cualquier
// sesión autenticada puede leer la lista de métodos activos.
routes.get('/all', getActivePaymentMethods)

routes.get('/admin/all',     requirePermission('payment-methods.view'),   allPaymentMethodsAdmin)
routes.post('/create',       requirePermission('payment-methods.create'), createPaymentMethod)
routes.put('/update/:id',    requirePermission('payment-methods.update'), updatePaymentMethod)
routes.delete('/delete/:id', requirePermission('payment-methods.delete'), deletePaymentMethod)

module.exports = routes
