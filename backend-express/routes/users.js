const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/auth');
const { getAllUsers, createUser, updateUserRole, deleteUser } = require('../controllers/userController');

// Hanya super_admin
router.get('/', verifyToken, allowRoles('super_admin'), getAllUsers);
router.post('/', verifyToken, allowRoles('super_admin'), createUser);
router.patch('/:id/role', verifyToken, allowRoles('super_admin'), updateUserRole);
router.delete('/:id', verifyToken, allowRoles('super_admin'), deleteUser);

module.exports = router;
