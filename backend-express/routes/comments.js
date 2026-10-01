const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/auth');
const { getCommentsByReport, createComment, updateComment, deleteComment } = require('../controllers/commentController');

// Public
router.get('/:report_id', getCommentsByReport);

// Authenticated
router.post('/', verifyToken, allowRoles('user', 'admin', 'super_admin'), createComment);
router.put('/:id', verifyToken, allowRoles('user', 'admin', 'super_admin'), updateComment);
router.delete('/:id', verifyToken, allowRoles('user', 'admin', 'super_admin'), deleteComment);

module.exports = router;
