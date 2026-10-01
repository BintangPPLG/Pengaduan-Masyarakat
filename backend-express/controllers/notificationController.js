const db = require('../config/db');

/**
 * createNotification — internal helper, tidak expose ke route.
 * Bisa diimpor dari controller lain: const { createNotification } = require('./notificationController');
 */
async function createNotification(userId, type, title, message, referenceId = null) {
  try {
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message, reference_id) VALUES (?, ?, ?, ?, ?)',
      [userId, type, title, message, referenceId]
    );
  } catch (err) {
    // Notifikasi gagal tidak boleh merusak flow utama
    console.error('[Notification] Failed to create:', err.message);
  }
}

const getMyNotifications = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, type } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let where = 'WHERE user_id = ?';
    const params = [userId];

    if (type) {
      where += ' AND type = ?';
      params.push(type);
    }

    const countParams = [...params];
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM notifications ${where}`,
      countParams
    );

    const rows = await db.query(
      `SELECT id, type, title, message, reference_id, is_read, created_at
       FROM notifications ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      data: rows[0],
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getUnreadCount = async (req, res) => {
  const userId = req.user.id;
  try {
    const [[{ count }]] = await db.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    res.json({ message: 'Notifikasi ditandai sudah dibaca' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const markAllAsRead = async (req, res) => {
  const userId = req.user.id;
  try {
    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    res.json({ message: 'Semua notifikasi ditandai sudah dibaca' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
