// ─── Notification Service ─────────────────────────────────

const { notificationRepository } = require('../repositories');
const { NotFoundError } = require('../lib/errors');
const logger = require('../lib/logger');

const notificationService = {
  async getNotifications(userId, query) {
    return notificationRepository.findAll(userId, query);
  },

  async markAsRead(id, userId) {
    const notification = await notificationRepository.findById(id, userId);
    if (!notification) throw new NotFoundError('Notification');
    return notificationRepository.markAsRead(id, userId);
  },

  async markAllAsRead(userId) {
    await notificationRepository.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  },

  async deleteNotification(id, userId) {
    const notification = await notificationRepository.findById(id, userId);
    if (!notification) throw new NotFoundError('Notification');
    await notificationRepository.delete(id, userId);
    logger.info('Notification deleted', { notificationId: id, userId });
  },

  async deleteAll(userId) {
    await notificationRepository.deleteAll(userId);
    return { message: 'All notifications deleted' };
  },

  async getUnreadCount(userId) {
    const count = await notificationRepository.getUnreadCount(userId);
    return { unreadCount: count };
  },
};

module.exports = notificationService;
