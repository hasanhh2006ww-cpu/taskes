// ─── Calendar Service ──────────────────────────────────────

const { calendarRepository } = require('../repositories');
const { NotFoundError } = require('../lib/errors');
const logger = require('../lib/logger');

const calendarService = {
  async getEvents(userId, query) {
    return calendarRepository.findAll(userId, query);
  },

  async getEvent(id, userId) {
    const event = await calendarRepository.findById(id, userId);
    if (!event) throw new NotFoundError('Calendar event');
    return event;
  },

  async createEvent(userId, data) {
    const event = await calendarRepository.create({
      ...data,
      date: new Date(data.date),
      startTime: data.startTime ? new Date(data.startTime) : null,
      endTime: data.endTime ? new Date(data.endTime) : null,
      userId,
    });
    logger.info('Calendar event created', { eventId: event.id, userId });
    return event;
  },

  async updateEvent(id, userId, data) {
    const existing = await calendarRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Calendar event');

    const updateData = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);

    const event = await calendarRepository.update(id, userId, updateData);
    logger.info('Calendar event updated', { eventId: id, userId });
    return event;
  },

  async deleteEvent(id, userId) {
    const existing = await calendarRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Calendar event');
    await calendarRepository.delete(id, userId);
    logger.info('Calendar event deleted', { eventId: id, userId });
  },

  async getMonthEvents(userId, year, month) {
    return calendarRepository.getMonthEvents(userId, year, month);
  },
};

module.exports = calendarService;
