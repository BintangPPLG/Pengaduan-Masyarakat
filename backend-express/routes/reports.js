const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken, allowRoles } = require('../middleware/auth');
const {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  updateReportStatus,
  getStats,
  getAdvancedStats,
  getAdminPerformance,
} = require('../controllers/reportController');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan (JPG, PNG, GIF)'));
    }
  },
});

// Helper: tangani error dari multer secara bersih
function withUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: `Ukuran foto melebihi batas maksimal 5 MB. Silakan pilih foto yang lebih kecil.`,
          });
        }
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
}

// Public
router.get('/', getAllReports);

// Admin / super_admin — harus sebelum /:id agar tidak tertangkap sebagai id
router.get('/_stats/summary', verifyToken, allowRoles('admin', 'super_admin'), getStats);
router.get('/_stats/advanced', verifyToken, allowRoles('admin', 'super_admin'), getAdvancedStats);
router.get('/_stats/admin-performance', verifyToken, allowRoles('super_admin'), getAdminPerformance);

router.get('/:id', getReportById);

// User (login)
router.post('/', verifyToken, allowRoles('user', 'admin', 'super_admin'), withUpload(upload.array('images', 5)), createReport);
router.put('/:id', verifyToken, allowRoles('user', 'admin', 'super_admin'), withUpload(upload.array('images', 5)), updateReport);
router.delete('/:id', verifyToken, allowRoles('user', 'admin', 'super_admin'), deleteReport);

// Admin / super_admin
router.patch('/:id/status', verifyToken, allowRoles('admin', 'super_admin'), updateReportStatus);

module.exports = router;
