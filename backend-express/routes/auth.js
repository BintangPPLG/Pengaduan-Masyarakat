const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { register, login, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, logout);

module.exports = router;
