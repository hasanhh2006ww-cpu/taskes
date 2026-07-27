// ─── Settings Service ──────────────────────────────────────

const prisma = require('../lib/prisma');
const { hashPassword, comparePassword } = require('../lib/crypto');
const { userRepository } = require('../repositories');
const { NotFoundError, ValidationError } = require('../lib/errors');
const logger = require('../lib/logger');

const settingsService = {
  async getSettings(userId) {
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId },
      });
    }

    return settings;
  },

  async updateSettings(userId, data) {
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId, ...data },
      });
    } else {
      settings = await prisma.userSettings.update({
        where: { userId },
        data,
      });
    }

    logger.info('Settings updated', { userId });
    return settings;
  },

  async updateProfile(userId, data) {
    const user = await userRepository.update(userId, data);
    logger.info('Profile updated', { userId });
    return user;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new ValidationError('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await userRepository.update(userId, { password: hashedPassword });

    logger.info('Password changed', { userId });
    return { message: 'Password changed successfully' };
  },

  async deleteAccount(userId) {
    await userRepository.softDelete(userId);
    logger.info('Account deleted', { userId });
    return { message: 'Account deleted successfully' };
  },
};

module.exports = settingsService;
