const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/auth');
const { getAuditLogs } = require('../controllers/auditLogController');

router.get('/', verifyToken, allowRoles('super_admin'), getAuditLogs);

module.exports = router;
