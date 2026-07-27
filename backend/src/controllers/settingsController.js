// ─── Settings Controller ───────────────────────────────────

const { settingsService } = require('../services');
const { HTTP_STATUS } = require('../types');

const settingsController = {
  async getSettings(req, res, next) {
    try {
      const settings = await settingsService.getSettings(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: settings });
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req, res, next) {
    try {
      const settings = await settingsService.updateSettings(req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: settings });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const user = await settingsService.updateProfile(req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const result = await settingsService.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword
      );
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async deleteAccount(req, res, next) {
    try {
      const result = await settingsService.deleteAccount(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = settingsController;
