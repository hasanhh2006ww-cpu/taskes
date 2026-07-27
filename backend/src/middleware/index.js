// ─── Middleware Barrel ──────────────────────────────────────

const { authenticate } = require('./auth');
const { validate, validateQuery, validateParams } = require('./validate');
const { apiLimiter, authLimiter, emailLimiter } = require('./rateLimiter');
const errorHandler = require('./errorHandler');

module.exports = {
  authenticate,
  validate,
  validateQuery,
  validateParams,
  apiLimiter,
  authLimiter,
  emailLimiter,
  errorHandler,
};
