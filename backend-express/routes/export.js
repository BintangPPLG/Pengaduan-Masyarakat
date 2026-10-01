const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/auth');
const { exportReportsPdf } = require('../controllers/exportController');

router.get('/reports/pdf', verifyToken, allowRoles('admin', 'super_admin'), exportReportsPdf);

module.exports = router;
