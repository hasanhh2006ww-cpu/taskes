// ─── Notification Controller ───────────────────────────────

const { notificationService } = require('../services');
const { HTTP_STATUS } = require('../types');

const notificationController = {
  async getAll(req, res, next) {
    try {
      const unreadOnly = req.query.unreadOnly === 'true';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await notificationService.getNotifications(req.user.id, { unreadOnly, page, limit });
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: notification });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await notificationService.deleteNotification(req.params.id, req.user.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },

  async deleteAll(req, res, next) {
    try {
      const result = await notificationService.deleteAll(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req, res, next) {
    try {
      const result = await notificationService.getUnreadCount(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = notificationController;
