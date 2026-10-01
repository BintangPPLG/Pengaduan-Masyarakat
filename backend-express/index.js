const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder untuk gambar
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes — existing
const authRoutes       = require('./routes/auth');
const userRoutes       = require('./routes/users');
const categoryRoutes   = require('./routes/categories');
const reportRoutes     = require('./routes/reports');
const commentRoutes    = require('./routes/comments');

// Routes — new features
const notificationRoutes = require('./routes/notifications');
const auditLogRoutes     = require('./routes/auditLogs');
const exportRoutes       = require('./routes/export');

// Register routes — existing (tidak diubah pathnya)
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/reports', reportRoutes);
app.use('/comments', commentRoutes);

// Register routes — new features
app.use('/notifications', notificationRoutes);
app.use('/audit-logs', auditLogRoutes);
app.use('/export', exportRoutes);

// Route default
app.get('/', (req, res) => {
  res.json({ message: 'Backend API Express JS + MySQL — SuaraWarga v2' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
