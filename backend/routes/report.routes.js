const { Router } = require('express')
const {
  getSummary,
  getReturnsReport,
  getRefundsReport,
  getShipmentsReport,
  getSalesReport,
} = require('../controllers/report/report.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

const router = Router()

router.get('/summary',   requirePermission('reports.view'), getSummary)
router.get('/returns',   requirePermission('reports.view'), getReturnsReport)
router.get('/refunds',   requirePermission('reports.view'), getRefundsReport)
router.get('/shipments', requirePermission('reports.view'), getShipmentsReport)
router.get('/sales',     requirePermission('reports.view'), getSalesReport)

module.exports = router
