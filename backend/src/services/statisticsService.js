// ─── Statistics Service ────────────────────────────────────

const { statisticsRepository } = require('../repositories');

const statisticsService = {
  async getDashboardStats(userId) {
    return statisticsRepository.getDashboardStats(userId);
  },

  async getDailyStats(userId, date) {
    return statisticsRepository.getDailyStats(userId, new Date(date));
  },

  async getWeeklyStats(userId) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return statisticsRepository.getWeeklyStats(userId, startOfWeek, endOfWeek);
  },

  async getMonthlyStats(userId, year, month) {
    return statisticsRepository.getMonthlyStats(userId, year, month);
  },

  async getCustomRange(userId, startDate, endDate) {
    return statisticsRepository.getWeeklyStats(
      userId,
      new Date(startDate),
      new Date(endDate)
    );
  },
};

module.exports = statisticsService;
