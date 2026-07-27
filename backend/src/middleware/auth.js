// ─── Authentication Middleware ─────────────────────────────

const { verifyAccessToken } = require('../lib/tokens');
const prisma = require('../lib/prisma');
const { UnauthorizedError } = require('../lib/errors');
const logger = require('../lib/logger');

/**
 * Require authentication - attaches user to request
 */
async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      logger.error('Authentication error', { error: error.message });
      next(new UnauthorizedError('Authentication failed'));
    }
  }
}

/**
 * Optional authentication - attaches user if token present
 */
async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (decoded) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true },
      });
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Silently continue without user
  }
  next();
}

module.exports = { authenticate, optionalAuth };
