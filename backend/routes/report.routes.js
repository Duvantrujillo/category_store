const { Router } = require('express')
const {
  getSummary,
  getReturnsReport,
  getRefundsReport,
  getShipmentsReport,
  getSalesReport,
  getDetailedReport,
  getDiscountCodeReport,
} = require('../controllers/report/report.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

const router = Router()

router.get('/summary',        requirePermission('reports.view'), getSummary)
router.get('/returns',        requirePermission('reports.view'), getReturnsReport)
router.get('/refunds',        requirePermission('reports.view'), getRefundsReport)
router.get('/shipments',      requirePermission('reports.view'), getShipmentsReport)
router.get('/sales',          requirePermission('reports.view'), getSalesReport)
router.get('/detailed',       requirePermission('reports.view'), getDetailedReport)
router.get('/discount-codes', requirePermission('reports.view'), getDiscountCodeReport)

module.exports = router
