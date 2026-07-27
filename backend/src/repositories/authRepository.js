// ─── Auth Token Repository ─────────────────────────────────

const prisma = require('../lib/prisma');

const authRepository = {
  // Email Verification Tokens
  async createEmailVerificationToken(data) {
    return prisma.emailVerificationToken.create({ data });
  },

  async findEmailVerificationToken(token) {
    return prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  async useEmailVerificationToken(id) {
    return prisma.emailVerificationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },

  async revokeUserEmailTokens(userId) {
    return prisma.emailVerificationToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  },

  // Password Reset Tokens
  async createPasswordResetToken(data) {
    return prisma.passwordResetToken.create({ data });
  },

  async findPasswordResetToken(token) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  async usePasswordResetToken(id) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },

  async revokeUserPasswordTokens(userId) {
    return prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  },

  // Refresh Tokens
  async createRefreshToken(data) {
    return prisma.refreshToken.create({ data });
  },

  async findRefreshToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  },

  async revokeRefreshToken(id) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  },

  async revokeUserRefreshTokens(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  },

  async cleanupExpiredTokens() {
    const now = new Date();
    await Promise.all([
      prisma.emailVerificationToken.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: now } } }),
    ]);
  },
};

module.exports = authRepository;
