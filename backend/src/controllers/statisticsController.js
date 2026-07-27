// ─── Statistics Controller ─────────────────────────────────

const { statisticsService } = require('../services');
const { HTTP_STATUS } = require('../types');

const statisticsController = {
  async getDashboard(req, res, next) {
    try {
      const stats = await statisticsService.getDashboardStats(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  },

  async getDaily(req, res, next) {
    try {
      const date = req.query.date || new Date().toISOString().split('T')[0];
      const stats = await statisticsService.getDailyStats(req.user.id, date);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  },

  async getWeekly(req, res, next) {
    try {
      const stats = await statisticsService.getWeeklyStats(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  },

  async getMonthly(req, res, next) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
      const stats = await statisticsService.getMonthlyStats(req.user.id, year, month);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  },

  async getCustomRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          status: 'error',
          message: 'startDate and endDate are required',
        });
      }
      const stats = await statisticsService.getCustomRange(req.user.id, startDate, endDate);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = statisticsController;
