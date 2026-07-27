// ─── Focus / Pomodoro Service ──────────────────────────────

const prisma = require('../lib/prisma');
const { NotFoundError } = require('../lib/errors');
const { buildPaginationMeta, parsePagination } = require('../utils/pagination');
const logger = require('../lib/logger');

const focusService = {
  async getSessions(userId, query) {
    const { startDate, endDate } = query;
    const { page, limit, skip } = parsePagination(query, 20, 100);
    const where = { userId };

    if (startDate) where.sessionDate = { ...(where.sessionDate || {}), gte: new Date(startDate) };
    if (endDate) where.sessionDate = { ...(where.sessionDate || {}), lte: new Date(endDate) };

    const [sessions, total] = await Promise.all([
      prisma.pomodoroSession.findMany({
        where,
        orderBy: { sessionDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pomodoroSession.count({ where }),
    ]);

    return { sessions, ...buildPaginationMeta(total, page, limit) };
  },

  async createSession(userId, data) {
    const session = await prisma.pomodoroSession.create({
      data: { ...data, userId },
    });
    logger.info('Pomodoro session created', { sessionId: session.id, userId });
    return session;
  },

  async completeSession(id, userId, { interrupted = false }) {
    const existing = await prisma.pomodoroSession.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundError('Pomodoro session');

    const session = await prisma.pomodoroSession.update({
      where: { id },
      data: { completed: !interrupted, interrupted },
    });
    logger.info('Pomodoro session completed', { sessionId: id, userId, interrupted });
    return session;
  },

  async getTodayStats(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await prisma.pomodoroSession.findMany({
      where: {
        userId,
        sessionDate: { gte: today, lt: tomorrow },
      },
    });

    const totalDuration = sessions
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + s.duration, 0);

    return {
      totalSessions: sessions.length,
      completedSessions: sessions.filter((s) => s.completed).length,
      interruptedSessions: sessions.filter((s) => s.interrupted).length,
      totalMinutes: totalDuration,
    };
  },
};

module.exports = focusService;
