// ─── Global Error Handler ──────────────────────────────────

const logger = require('../lib/logger');
const { AppError } = require('../lib/errors');
const config = require('../config');

function errorHandler(err, req, res, _next) {
  // Log the error
  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error(`Unexpected error: ${err.message}`, {
      stack: config.isDev ? err.stack : undefined,
      path: req.path,
      method: req.method,
    });
  }

  // Prisma known errors
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(config.isDev && err.isOperational && { errors: err.errors }),
    ...(config.isDev && { stack: err.stack }),
  });
}

function handlePrismaError(err, res) {
  let statusCode = 400;
  let message = 'Database error';

  switch (err.code) {
    case 'P2002':
      statusCode = 409;
      const target = err.meta?.target?.join(', ') || 'field';
      message = `A record with this ${target} already exists`;
      break;
    case 'P2025':
      statusCode = 404;
      message = 'Record not found';
      break;
    case 'P2003':
      statusCode = 400;
      message = 'Referenced record does not exist';
      break;
    case 'P2014':
      statusCode = 400;
      message = 'Constraint violation';
      break;
  }

  logger.error(`Prisma error: ${err.code}`, { message: err.message });

  res.status(statusCode).json({
    status: 'error',
    message,
  });
}

module.exports = errorHandler;
