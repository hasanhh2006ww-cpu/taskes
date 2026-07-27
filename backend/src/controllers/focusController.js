// ─── Focus / Pomodoro Controller ───────────────────────────

const { focusService } = require('../services');
const { HTTP_STATUS } = require('../types');

const focusController = {
  async getAll(req, res, next) {
    try {
      const result = await focusService.getSessions(req.user.id, req.query);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const session = await focusService.createSession(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: session });
    } catch (error) {
      next(error);
    }
  },

  async complete(req, res, next) {
    try {
      const session = await focusService.completeSession(req.params.id, req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: session });
    } catch (error) {
      next(error);
    }
  },

  async todayStats(req, res, next) {
    try {
      const stats = await focusService.getTodayStats(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = focusController;
