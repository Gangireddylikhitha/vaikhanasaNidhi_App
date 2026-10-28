const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');
const AppError = require('../utils/AppError');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.post('/guest', authController.guestLogin);
router.post('/refresh', authController.refresh);
router.post('/change-password', authController.changePassword);
router.post('/forgot-password/lookup', authController.forgotPasswordLookup);
router.post('/forgot-password/send-otp', authController.forgotPasswordSendOtp);
router.post('/forgot-password/reset', authController.forgotPasswordReset);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

// Catch any unhandled /auth routes so they don't fall through to publicRoutes and trigger false 401s
router.use((req, res, next) => {
  next(new AppError(`Auth route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
});

module.exports = router;
