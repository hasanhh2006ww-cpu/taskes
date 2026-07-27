// ─── Calendar Controller ───────────────────────────────────

const { calendarService } = require('../services');
const { HTTP_STATUS } = require('../types');

const calendarController = {
  async getAll(req, res, next) {
    try {
      const result = await calendarService.getEvents(req.user.id, req.query);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const event = await calendarService.getEvent(req.params.id, req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: event });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const event = await calendarService.createEvent(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: event });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const event = await calendarService.updateEvent(req.params.id, req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: event });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await calendarService.deleteEvent(req.params.id, req.user.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },

  async getMonth(req, res, next) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
      const events = await calendarService.getMonthEvents(req.user.id, year, month);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: events });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = calendarController;
