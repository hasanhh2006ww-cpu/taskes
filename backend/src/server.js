// ─── Express Server Entry Point ────────────────────────────

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const config = require('./config');
const routes = require('./routes');
const { errorHandler } = require('./middleware');
const logger = require('./lib/logger');
const prisma = require('./lib/prisma');
const { authService } = require('./services');

const app = express();

// ─── Security Middleware ───────────────────────────────────

// CORS
app.use(cors({
  origin: config.app.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// ─── Body Parsing ──────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files (Uploads) ───────────────────────────────-

app.use('/uploads', express.static('uploads'));

// ─── Request Logging ───────────────────────────────────────

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// ─── Multer Error Handler ─────────────────────────────────

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File size exceeds the maximum limit'
      : err.code === 'LIMIT_FILE_COUNT'
        ? 'Too many files'
        : err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Unexpected file field'
          : 'File upload error';
    return res.status(400).json({
      status: 'error',
      message,
    });
  }
  next(err);
});

// ─── API Routes ────────────────────────────────────────────

app.use(config.app.apiPrefix, routes);

// ─── 404 Handler ───────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found`,
  });
});

// ─── Global Error Handler ──────────────────────────────────

app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────

async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('Database connected');

    // Start listening
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API: http://localhost:${config.port}${config.app.apiPrefix}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// ─── Graceful Shutdown ─────────────────────────────────────

async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason });
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message });
  process.exit(1);
});

// ─── Scheduled Jobs ───────────────────────────────────────

// Clean up expired auth tokens daily
setInterval(
  () => authService.cleanupExpiredTokens().catch((err) => logger.error('Token cleanup failed', { error: err.message })),
  24 * 60 * 60 * 1000
);

startServer();

module.exports = app;
