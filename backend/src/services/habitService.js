// ─── Habit Service ─────────────────────────────────────────

const { habitRepository } = require('../repositories');
const { NotFoundError } = require('../lib/errors');
const logger = require('../lib/logger');

const habitService = {
  async getHabits(userId, options) {
    return habitRepository.findAll(userId, options);
  },

  async getHabit(id, userId) {
    const habit = await habitRepository.findById(id, userId);
    if (!habit) throw new NotFoundError('Habit');
    return habit;
  },

  async createHabit(userId, data) {
    const habit = await habitRepository.create({ ...data, userId });
    logger.info('Habit created', { habitId: habit.id, userId });
    return habit;
  },

  async updateHabit(id, userId, data) {
    const existing = await habitRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Habit');

    const habit = await habitRepository.update(id, userId, data);
    logger.info('Habit updated', { habitId: id, userId });
    return habit;
  },

  async deleteHabit(id, userId) {
    const existing = await habitRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Habit');
    await habitRepository.delete(id, userId);
    logger.info('Habit deleted', { habitId: id, userId });
  },

  async logCompletion(habitId, userId, { date, completed }) {
    const existing = await habitRepository.findById(habitId, userId);
    if (!existing) throw new NotFoundError('Habit');

    const logDate = new Date(date);
    const log = await habitRepository.logCompletion(habitId, logDate, completed);

    // Update streak
    const logs = await habitRepository.getLogs(
      habitId,
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    );

    // Calculate streak
    let streak = 0;
    const sortedLogs = logs
      .filter((l) => l.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (sortedLogs.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastLogDate = new Date(sortedLogs[0].date);
      lastLogDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today.getTime() - lastLogDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays <= 1) {
        streak = 1;
        for (let i = 1; i < sortedLogs.length; i++) {
          const prev = new Date(sortedLogs[i - 1].date);
          const curr = new Date(sortedLogs[i].date);
          const dayDiff = Math.floor((prev.getTime() - curr.getTime()) / (24 * 60 * 60 * 1000));
          if (dayDiff === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // Update habit with streak
    const habit = await habitRepository.update(habitId, userId, {
      streak,
      bestStreak: Math.max(streak, existing.bestStreak),
      lastCompletedDate: completed ? logDate : existing.lastCompletedDate,
    });

    return { log, habit };
  },

  async getStreaks(userId) {
    return habitRepository.getStreaks(userId);
  },

  async getLogs(habitId, userId, startDate, endDate) {
    const existing = await habitRepository.findById(habitId, userId);
    if (!existing) throw new NotFoundError('Habit');
    return habitRepository.getLogs(
      habitId,
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );
  },
};

module.exports = habitService;
