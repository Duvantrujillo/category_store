const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboard/dashboard.controller');
const { requirePermission } = require('../middlewares/permission.middleware');

router.get('/stats', requirePermission('dashboard.view'), getStats);

module.exports = router;
