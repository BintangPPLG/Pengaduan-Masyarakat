const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware: verifikasi JWT token dari header Authorization: Bearer <token>
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1]; // Ambil token setelah "Bearer"

  if (!token) {
    return res.status(401).json({ message: 'Format token tidak valid' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token expired atau tidak valid' });
  }
};

// Middleware: cek role user yang sudah login
// Penggunaan: allowRoles('admin', 'super_admin')
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized, silakan login terlebih dahulu' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak. Role tidak sesuai.' });
    }

    next();
  };
};

module.exports = { verifyToken, allowRoles };
