// ─── JWT Token Utilities ───────────────────────────────────

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const logger = require('./logger');

/**
 * Generate an access token (short-lived)
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
}

/**
 * Generate a refresh token (long-lived)
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

/**
 * Verify an access token
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Access token expired');
    } else {
      logger.error('Invalid access token', { error: error.message });
    }
    return null;
  }
}

/**
 * Verify a refresh token
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Refresh token expired');
    } else {
      logger.error('Invalid refresh token', { error: error.message });
    }
    return null;
  }
}

/**
 * Generate a cryptographically secure random token
 */
function generateCryptoToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate token expiry date
 */
function getTokenExpiry(hours = 24) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateCryptoToken,
  getTokenExpiry,
};
