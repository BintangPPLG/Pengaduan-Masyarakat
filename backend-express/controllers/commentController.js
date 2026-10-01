const db = require('../config/db');
const { createNotification } = require('./notificationController');
const { logAudit } = require('./auditLogController');

const getCommentsByReport = async (req, res) => {
  const { report_id } = req.params;

  try {
    // Ambil semua komentar untuk laporan ini, termasuk parent_id
    const [rows] = await db.query(
      `SELECT
         c.id, c.comment, c.created_at, c.updated_at, c.parent_id,
         c.user_id,
         u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.public_report_id = ?
       ORDER BY c.created_at ASC`,
      [report_id]
    ).catch(async () => {
      // Fallback jika kolom parent_id/updated_at belum ada
      return db.query(
        `SELECT c.id, c.comment, c.created_at, c.user_id, u.username,
                NULL AS parent_id, NULL AS updated_at
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.public_report_id = ?
         ORDER BY c.created_at ASC`,
        [report_id]
      );
    });

    // Susun thread: komentar root + replies nested
    const map = {};
    const roots = [];

    rows.forEach((r) => {
      map[r.id] = { ...r, replies: [] };
    });
    rows.forEach((r) => {
      if (r.parent_id && map[r.parent_id]) {
        map[r.parent_id].replies.push(map[r.id]);
      } else {
        roots.push(map[r.id]);
      }
    });

    res.json(roots);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createComment = async (req, res) => {
  const { public_report_id, comment, parent_id } = req.body;
  const user_id = req.user.id;
  const username = req.user.username;

  if (!public_report_id || !comment) {
    return res.status(400).json({ message: 'public_report_id dan comment wajib diisi' });
  }

  try {
    const [report] = await db.query(
      'SELECT id, user_id, header FROM public_reports WHERE id = ?',
      [public_report_id]
    );
    if (report.length === 0) {
      return res.status(404).json({ message: 'Report tidak ditemukan' });
    }

    let result;
    try {
      [result] = await db.query(
        'INSERT INTO comments (public_report_id, user_id, comment, parent_id) VALUES (?, ?, ?, ?)',
        [public_report_id, user_id, comment, parent_id || null]
      );
    } catch {
      // Fallback tanpa parent_id
      [result] = await db.query(
        'INSERT INTO comments (public_report_id, user_id, comment) VALUES (?, ?, ?)',
        [public_report_id, user_id, comment]
      );
    }

    const commentId = result.insertId;

    // Notifikasi
    if (parent_id) {
      // Reply — notif ke pemilik komentar parent
      const [parentRows] = await db.query('SELECT user_id FROM comments WHERE id = ?', [parent_id]);
      if (parentRows.length > 0 && parentRows[0].user_id !== user_id) {
        await createNotification(
          parentRows[0].user_id,
          'comment_reply',
          'Komentar Anda Dibalas',
          `${username} membalas komentar Anda di laporan "${report[0].header}"`,
          public_report_id
        );
      }
    } else {
      // Komentar baru — notif ke pemilik laporan (jika bukan diri sendiri)
      if (report[0].user_id !== user_id) {
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
        await createNotification(
          report[0].user_id,
          isAdmin ? 'admin_reply' : 'comment_new',
          isAdmin ? 'Balasan Admin' : 'Komentar Baru',
          isAdmin
            ? `Admin ${username} menanggapi laporan "${report[0].header}"`
            : `${username} menambahkan komentar pada laporan "${report[0].header}"`,
          public_report_id
        );
      }
    }

    res.status(201).json({ message: 'Komentar berhasil ditambahkan', id: commentId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateComment = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const user_id = req.user.id;

  if (!comment) {
    return res.status(400).json({ message: 'Komentar wajib diisi' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM comments WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }
    if (rows[0].user_id !== user_id) {
      return res.status(403).json({ message: 'Anda tidak berhak mengedit komentar ini' });
    }

    try {
      await db.query(
        'UPDATE comments SET comment = ?, updated_at = NOW() WHERE id = ?',
        [comment, id]
      );
    } catch {
      await db.query('UPDATE comments SET comment = ? WHERE id = ?', [comment, id]);
    }

    res.json({ message: 'Komentar berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const role = req.user.role;
  const username = req.user.username;

  try {
    const [rows] = await db.query('SELECT * FROM comments WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }

    const isPrivileged = role === 'admin' || role === 'super_admin';
    if (!isPrivileged && rows[0].user_id !== user_id) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus komentar ini' });
    }

    await db.query('DELETE FROM comments WHERE id = ?', [id]);

    if (isPrivileged && rows[0].user_id !== user_id) {
      await logAudit(user_id, username, role, 'delete_comment', `Hapus komentar #${id}`, req.ip);
    }

    res.json({ message: 'Komentar berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getCommentsByReport, createComment, updateComment, deleteComment };
