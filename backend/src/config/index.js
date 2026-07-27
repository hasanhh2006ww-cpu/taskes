// ─── Centralized Configuration ─────────────────────────────
// Loads and validates all environment variables

require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // Database
  database: {
    url: process.env.DATABASE_URL,
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'My Taske <noreply@my-taske.com>',
  },

  // App
  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
};

// Required env vars validation
const REQUIRED_VARS = [
  ['DATABASE_URL', config.database.url],
  ['JWT_ACCESS_SECRET', config.jwt.accessSecret],
  ['JWT_REFRESH_SECRET', config.jwt.refreshSecret],
];

for (const [name, value] of REQUIRED_VARS) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

module.exports = config;
