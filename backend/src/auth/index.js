// ─── Auth Module ───────────────────────────────────────────
// Centralized exports for authentication-related components

const authService = require('../services/authService');
const authController = require('../controllers/authController');
const { authenticate, authLimiter } = require('../middleware');

module.exports = {
  authService,
  authController,
  authenticate,
  authLimiter,
};
