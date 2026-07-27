// ─── Habit Controller ──────────────────────────────────────

const { habitService } = require('../services');
const { HTTP_STATUS } = require('../types');

const habitController = {
  async getAll(req, res, next) {
    try {
      const { type, isActive, page, limit } = req.query;
      const result = await habitService.getHabits(req.user.id, {
        type,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
      });
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const habit = await habitService.getHabit(req.params.id, req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: habit });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const habit = await habitService.createHabit(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: habit });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const habit = await habitService.updateHabit(req.params.id, req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: habit });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await habitService.deleteHabit(req.params.id, req.user.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },

  async logCompletion(req, res, next) {
    try {
      const result = await habitService.logCompletion(req.params.id, req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async getLogs(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const logs = await habitService.getLogs(req.params.id, req.user.id, startDate, endDate);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: logs });
    } catch (error) {
      next(error);
    }
  },

  async getStreaks(req, res, next) {
    try {
      const streaks = await habitService.getStreaks(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: streaks });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = habitController;
