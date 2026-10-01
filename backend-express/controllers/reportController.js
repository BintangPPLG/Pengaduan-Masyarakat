const db = require('../config/db');
const { createNotification } = require('./notificationController');
const { logAudit } = require('./auditLogController');

async function queryReportsWithOptionalRejectedReason(sqlWithReason, sqlWithoutReason, params) {
  try {
    const [rows] = await db.query(sqlWithReason, params);
    return rows;
  } catch (err) {
    if (err && err.code === 'ER_BAD_FIELD_ERROR') {
      const [rows] = await db.query(sqlWithoutReason, params);
      return rows;
    }
    throw err;
  }
}

const getAllReports = async (req, res) => {
  try {
    const rows = await queryReportsWithOptionalRejectedReason(
      `SELECT pr.id, pr.header, pr.body, pr.image, pr.images, pr.status, pr.created_at,
              pr.rejected_reason, u.username, u.email, c.category_name
       FROM public_reports pr
       JOIN users u ON pr.user_id = u.id
       JOIN categories c ON pr.category_id = c.id
       ORDER BY pr.created_at DESC`,
      `SELECT pr.id, pr.header, pr.body, pr.image, pr.images, pr.status, pr.created_at,
              u.username, u.email, c.category_name
       FROM public_reports pr
       JOIN users u ON pr.user_id = u.id
       JOIN categories c ON pr.category_id = c.id
       ORDER BY pr.created_at DESC`,
      []
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getReportById = async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await queryReportsWithOptionalRejectedReason(
      `SELECT pr.id, pr.header, pr.body, pr.image, pr.images, pr.status, pr.created_at,
              pr.rejected_reason, u.id AS user_id, u.username, u.email, c.category_name
       FROM public_reports pr
       JOIN users u ON pr.user_id = u.id
       JOIN categories c ON pr.category_id = c.id
       WHERE pr.id = ?`,
      `SELECT pr.id, pr.header, pr.body, pr.image, pr.images, pr.status, pr.created_at,
              u.id AS user_id, u.username, u.email, c.category_name
       FROM public_reports pr
       JOIN users u ON pr.user_id = u.id
       JOIN categories c ON pr.category_id = c.id
       WHERE pr.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Report tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createReport = async (req, res) => {
  const { header, body, category_id } = req.body;
  const user_id = req.user.id;
  const username = req.user.username;

  if (!header || !body || !category_id) {
    return res.status(400).json({ message: 'Header, body, dan category_id wajib diisi' });
  }

  // Support multi-image upload (req.files) and legacy single (req.file)
  let imagePaths = null;
  if (req.files && req.files.length > 0) {
    imagePaths = JSON.stringify(req.files.map((f) => f.path.replace(/\\/g, '/')));
  } else if (req.file) {
    imagePaths = JSON.stringify([req.file.path.replace(/\\/g, '/')]);
  }

  // Backward-compat: first image for legacy `image` column
  const legacyImage = imagePaths ? JSON.parse(imagePaths)[0] : null;

  try {
    const [result] = await db.query(
      'INSERT INTO public_reports (header, body, user_id, category_id, image, images, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [header, body, user_id, category_id, legacyImage, imagePaths, 'pending']
    );

    const reportId = result.insertId;

    // Notifikasi untuk pelapor
    await createNotification(
      user_id,
      'report_created',
      'Pengaduan Berhasil Dibuat',
      `Pengaduan "${header}" telah berhasil dibuat dan menunggu verifikasi admin.`,
      reportId
    );

    // Audit log
    await logAudit(
      user_id, username, req.user.role,
      'create_report',
      `Membuat laporan #${reportId}: "${header}"`,
      req.ip
    );

    res.status(201).json({ message: 'Report berhasil dibuat', id: reportId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateReport = async (req, res) => {
  const { id } = req.params;
  const { header, body, category_id } = req.body;
  const user_id = req.user.id;
  const username = req.user.username;

  try {
    const [rows] = await db.query('SELECT * FROM public_reports WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Report tidak ditemukan' });
    }
    if (rows[0].user_id !== user_id) {
      return res.status(403).json({ message: 'Anda tidak berhak mengedit report ini' });
    }

    const newHeader = header || rows[0].header;
    const newBody = body || rows[0].body;
    const newCategoryId = category_id || rows[0].category_id;

    let newImages = rows[0].images || null;
    let newLegacyImage = rows[0].image || null;
    if (req.files && req.files.length > 0) {
      newImages = JSON.stringify(req.files.map((f) => f.path.replace(/\\/g, '/')));
      newLegacyImage = JSON.parse(newImages)[0];
    } else if (req.file) {
      newImages = JSON.stringify([req.file.path.replace(/\\/g, '/')]);
      newLegacyImage = req.file.path.replace(/\\/g, '/');
    }

    await db.query(
      'UPDATE public_reports SET header = ?, body = ?, category_id = ?, image = ?, images = ? WHERE id = ?',
      [newHeader, newBody, newCategoryId, newLegacyImage, newImages, id]
    );

    await logAudit(user_id, username, req.user.role, 'edit_report', `Edit laporan #${id}`, req.ip);

    res.json({ message: 'Report berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteReport = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const username = req.user.username;
  const role = req.user.role;

  try {
    const [rows] = await db.query('SELECT * FROM public_reports WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Report tidak ditemukan' });
    }

    const isPrivileged = role === 'admin' || role === 'super_admin';
    if (!isPrivileged && rows[0].user_id !== user_id) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus report ini' });
    }

    await db.query('DELETE FROM public_reports WHERE id = ?', [id]);

    await logAudit(user_id, username, role, 'delete_report', `Hapus laporan #${id}: "${rows[0].header}"`, req.ip);

    res.json({ message: 'Report berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status, rejected_reason } = req.body;
  const adminId = req.user.id;
  const adminUsername = req.user.username;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status harus approved atau rejected' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, user_id, header FROM public_reports WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Report tidak ditemukan' });
    }

    const report = rows[0];

    if (status === 'rejected') {
      const reason = (rejected_reason || '').trim();
      if (!reason) {
        return res.status(400).json({ message: 'Alasan reject wajib diisi' });
      }
      try {
        await db.query(
          'UPDATE public_reports SET status = ?, rejected_reason = ? WHERE id = ?',
          [status, reason, id]
        );
      } catch (err) {
        if (err && err.code === 'ER_BAD_FIELD_ERROR') {
          await db.query('UPDATE public_reports SET status = ? WHERE id = ?', [status, id]);
        } else throw err;
      }
    } else {
      try {
        await db.query(
          'UPDATE public_reports SET status = ?, rejected_reason = NULL WHERE id = ?',
          [status, id]
        );
      } catch (err) {
        if (err && err.code === 'ER_BAD_FIELD_ERROR') {
          await db.query('UPDATE public_reports SET status = ? WHERE id = ?', [status, id]);
        } else throw err;
      }
    }

    // Notifikasi ke pelapor
    const notifType = status === 'approved' ? 'report_approved' : 'report_rejected';
    const notifTitle =
      status === 'approved' ? 'Pengaduan Disetujui' : 'Pengaduan Ditolak';
    const notifMsg =
      status === 'approved'
        ? `Pengaduan "${report.header}" telah disetujui oleh admin.`
        : `Pengaduan "${report.header}" ditolak. Alasan: ${rejected_reason}`;

    await createNotification(report.user_id, notifType, notifTitle, notifMsg, report.id);

    // Audit log
    await logAudit(
      adminId, adminUsername, req.user.role,
      'update_report_status',
      `Ubah status laporan #${id} menjadi ${status}${status === 'rejected' ? ': ' + rejected_reason : ''}`,
      req.ip
    );

    res.json({ message: `Report berhasil di-${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const toNum = (v) => Number(v ?? 0);

const getStats = async (req, res) => {
  try {
    const [[userCount]] = await db.query('SELECT COUNT(*) AS total_users FROM users');
    const [[reportCount]] = await db.query('SELECT COUNT(*) AS total_reports FROM public_reports');
    const [[approvedCount]] = await db.query("SELECT COUNT(*) AS total_approved FROM public_reports WHERE status = 'approved'");
    const [[rejectedCount]] = await db.query("SELECT COUNT(*) AS total_rejected FROM public_reports WHERE status = 'rejected'");
    const [[pendingCount]] = await db.query("SELECT COUNT(*) AS total_pending FROM public_reports WHERE status = 'pending'");

    res.json({
      users: toNum(userCount.total_users),
      reports: toNum(reportCount.total_reports),
      approved: toNum(approvedCount.total_approved),
      rejected: toNum(rejectedCount.total_rejected),
      pending: toNum(pendingCount.total_pending),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAdvancedStats = async (req, res) => {
  try {
    // Counts by period
    const [[today]] = await db.query(
      "SELECT COUNT(*) AS count FROM public_reports WHERE DATE(created_at) = CURDATE()"
    );
    const [[thisWeek]] = await db.query(
      "SELECT COUNT(*) AS count FROM public_reports WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)"
    );
    const [[thisMonth]] = await db.query(
      "SELECT COUNT(*) AS count FROM public_reports WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())"
    );
    const [[total]] = await db.query('SELECT COUNT(*) AS count FROM public_reports');
    const [[approved]] = await db.query("SELECT COUNT(*) AS count FROM public_reports WHERE status = 'approved'");
    const [[rejected]] = await db.query("SELECT COUNT(*) AS count FROM public_reports WHERE status = 'rejected'");
    const [[pending]] = await db.query("SELECT COUNT(*) AS count FROM public_reports WHERE status = 'pending'");

    // Per day last 30 days
    const [perDay] = await db.query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM public_reports
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Per month last 12 months
    const [perMonth] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
      FROM public_reports
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // By category
    const [byCategory] = await db.query(`
      SELECT c.category_name AS name, COUNT(pr.id) AS count
      FROM categories c
      LEFT JOIN public_reports pr ON pr.category_id = c.id
      GROUP BY c.id, c.category_name
      ORDER BY count DESC
    `);

    // By status
    const [byStatus] = await db.query(`
      SELECT status AS name, COUNT(*) AS count
      FROM public_reports
      GROUP BY status
    `);

    res.json({
      summary: {
        total: toNum(total.count),
        today: toNum(today.count),
        thisWeek: toNum(thisWeek.count),
        thisMonth: toNum(thisMonth.count),
        approved: toNum(approved.count),
        rejected: toNum(rejected.count),
        pending: toNum(pending.count),
      },
      perDay: perDay.map((row) => ({
        date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date),
        count: toNum(row.count),
      })),
      perMonth: perMonth.map((row) => ({
        month: String(row.month),
        count: toNum(row.count),
      })),
      byCategory: byCategory.map((row) => ({
        name: row.name,
        count: toNum(row.count),
      })),
      byStatus: byStatus.map((row) => ({
        name: row.name,
        count: toNum(row.count),
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAdminPerformance = async (req, res) => {
  const { dateFrom, dateTo } = req.query;

  try {
    const dateFilter = dateFrom && dateTo
      ? `AND al.created_at BETWEEN '${dateFrom} 00:00:00' AND '${dateTo} 23:59:59'`
      : '';

    const [admins] = await db.query(
      `SELECT u.id, u.username, u.role
       FROM users u WHERE u.role IN ('admin', 'super_admin')
       ORDER BY u.username`
    );

    const result = await Promise.all(
      admins.map(async (admin) => {
        // Count handled (status changes by this admin via audit log)
        const [[handled]] = await db.query(
          `SELECT COUNT(*) AS count FROM audit_logs
           WHERE user_id = ? AND action = 'update_report_status' ${dateFilter}`,
          [admin.id]
        );

        const [[approved]] = await db.query(
          `SELECT COUNT(*) AS count FROM audit_logs
           WHERE user_id = ? AND action = 'update_report_status' AND detail LIKE '%approved%' ${dateFilter}`,
          [admin.id]
        );

        const [[rejected]] = await db.query(
          `SELECT COUNT(*) AS count FROM audit_logs
           WHERE user_id = ? AND action = 'update_report_status' AND detail LIKE '%rejected%' ${dateFilter}`,
          [admin.id]
        );

        return {
          id: admin.id,
          username: admin.username,
          role: admin.role,
          handled: handled.count,
          approved: approved.count,
          rejected: rejected.count,
        };
      })
    );

    // Sort by handled desc
    result.sort((a, b) => b.handled - a.handled);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  updateReportStatus,
  getStats,
  getAdvancedStats,
  getAdminPerformance,
};
