// ─── Statistics Repository ─────────────────────────────────

const prisma = require('../lib/prisma');

const statisticsRepository = {
  async getDailyStats(userId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [tasksCompleted, tasksCreated, habitsCompleted, focusSessions] = await Promise.all([
      prisma.task.count({
        where: { userId, completedAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.task.count({
        where: { userId, createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.habitLog.count({
        where: {
          habit: { userId },
          date: { gte: startOfDay, lte: endOfDay },
          completed: true,
        },
      }),
      prisma.pomodoroSession.findMany({
        where: {
          userId,
          sessionDate: { gte: startOfDay, lte: endOfDay },
          completed: true,
        },
        select: { duration: true },
      }),
    ]);

    const focusMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0);

    // Upsert daily stats
    return prisma.dailyStats.upsert({
      where: { userId_date: { userId, date: startOfDay } },
      update: {
        tasksCompleted,
        tasksCreated,
        habitsCompleted,
        focusMinutes,
        focusSessions: focusSessions.length,
        pomodoroCount: focusSessions.length,
      },
      create: {
        userId,
        date: startOfDay,
        tasksCompleted,
        tasksCreated,
        habitsCompleted,
        focusMinutes,
        focusSessions: focusSessions.length,
        pomodoroCount: focusSessions.length,
      },
    });
  },

  async getWeeklyStats(userId, startDate, endDate) {
    return prisma.dailyStats.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  },

  async getMonthlyStats(userId, year, month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [dailyStats, totalTasks, completedTasks, totalHabits, totalFocus] = await Promise.all([
      prisma.dailyStats.findMany({
        where: { userId, date: { gte: start, lte: end } },
        orderBy: { date: 'asc' },
      }),
      prisma.task.count({
        where: { userId, deletedAt: null, createdAt: { lte: end } },
      }),
      prisma.task.count({
        where: { userId, completed: true, completedAt: { lte: end } },
      }),
      prisma.habit.count({
        where: { userId, deletedAt: null },
      }),
      prisma.pomodoroSession.aggregate({
        where: { userId, sessionDate: { gte: start, lte: end }, completed: true },
        _sum: { duration: true },
      }),
    ]);

    return {
      dailyStats,
      summary: {
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalHabits,
        totalFocusMinutes: totalFocus._sum.duration || 0,
      },
    };
  },

  async getDashboardStats(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const now = new Date();

    const [
      totalTasks,
      completedTasks,
      todayTasks,
      todayCompleted,
      overdueTasks,
      totalPomodoros,
      todayPomodoros,
      totalHabits,
      activeHabits,
      bestStreak,
    ] = await Promise.all([
      prisma.task.count({ where: { userId, deletedAt: null } }),
      prisma.task.count({ where: { userId, deletedAt: null, completed: true } }),
      prisma.task.count({ where: { userId, deletedAt: null, dueDate: { gte: today, lt: tomorrow } } }),
      prisma.task.count({
        where: { userId, deletedAt: null, completed: true, completedAt: { gte: today, lt: tomorrow } },
      }),
      prisma.task.count({
        where: { userId, deletedAt: null, completed: false, dueDate: { lt: now } },
      }),
      prisma.pomodoroSession.count({ where: { userId, completed: true } }),
      prisma.pomodoroSession.count({
        where: { userId, completed: true, sessionDate: { gte: today, lt: tomorrow } },
      }),
      prisma.habit.count({ where: { userId, deletedAt: null } }),
      prisma.habit.count({ where: { userId, deletedAt: null, isActive: true } }),
      prisma.habit.aggregate({ where: { userId, deletedAt: null }, _max: { bestStreak: true } }),
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate,
      todayTasks,
      todayCompleted,
      overdueTasks,
      totalPomodoros,
      todayPomodoros,
      totalHabits,
      activeHabits,
      bestStreak: bestStreak._max.bestStreak || 0,
    };
  },
};

module.exports = statisticsRepository;
