const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.post('/guest', authController.guestLogin);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
