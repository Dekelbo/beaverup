const express = require('express');
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/login', authLimiter, authController.login);
router.post('/signup', authLimiter, authController.signup);
router.post('/logout', authController.logout);

module.exports = router;
