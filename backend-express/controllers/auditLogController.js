const db = require('../config/db');

/**
 * logAudit — internal helper.
 * Import: const { logAudit } = require('./auditLogController');
 */
async function logAudit(userId, username, role, action, detail = null, ipAddress = null) {
  try {
    await db.query(
      'INSERT INTO audit_logs (user_id, username, role, action, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId || null, username || 'system', role || 'unknown', action, detail, ipAddress]
    );
  } catch (err) {
    console.error('[AuditLog] Failed to log:', err.message);
  }
}

const getAuditLogs = async (req, res) => {
  const { page = 1, limit = 25, search, role, dateFrom, dateTo } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(username LIKE ? OR action LIKE ? OR detail LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    if (dateFrom) {
      conditions.push('created_at >= ?');
      params.push(dateFrom + ' 00:00:00');
    }
    if (dateTo) {
      conditions.push('created_at <= ?');
      params.push(dateTo + ' 23:59:59');
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM audit_logs ${where}`,
      params
    );

    const [rows] = await db.query(
      `SELECT id, user_id, username, role, action, detail, ip_address, created_at
       FROM audit_logs ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      data: rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { logAudit, getAuditLogs };
