const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/auth');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// Public
router.get('/', getAllCategories);

// Admin / super_admin
router.post('/', verifyToken, allowRoles('admin', 'super_admin'), createCategory);
router.put('/:id', verifyToken, allowRoles('admin', 'super_admin'), updateCategory);
router.delete('/:id', verifyToken, allowRoles('admin', 'super_admin'), deleteCategory);

module.exports = router;
