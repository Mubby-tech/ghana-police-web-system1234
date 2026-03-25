const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Make sure routes are defined correctly
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;