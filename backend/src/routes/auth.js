// ─── Auth Routes ───────────────────────────────────────────

const { Router } = require('express');
const { authController } = require('../controllers');
const { authenticate, validate, authLimiter, emailLimiter } = require('../middleware');
const { auth: authValidators } = require('../validators');

const router = Router();

// Public routes (with rate limiting)
router.post('/register', authLimiter, validate(authValidators.registerSchema), authController.register);
router.post('/login', authLimiter, validate(authValidators.loginSchema), authController.login);
router.post('/refresh-token', validate(authValidators.refreshTokenSchema), authController.refreshToken);

// Email verification
router.post('/verify-email', validate(authValidators.verifyEmailSchema), authController.verifyEmail);
router.get('/verify-email', validate(authValidators.verifyEmailSchema), authController.verifyEmail);

// Password reset
router.post('/forgot-password', emailLimiter, validate(authValidators.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', emailLimiter, validate(authValidators.resetPasswordSchema), authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
