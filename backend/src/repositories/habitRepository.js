// ─── Habit Repository ──────────────────────────────────────

const prisma = require('../lib/prisma');
const { buildPaginationMeta, parsePagination } = require('../utils/pagination');

const habitInclude = {
  logs: { orderBy: { date: 'desc' }, take: 90 },
};

const habitRepository = {
  async findById(id, userId) {
    return prisma.habit.findFirst({
      where: { id, userId, deletedAt: null },
      include: habitInclude,
    });
  },

  async findAll(userId, options = {}) {
    const { type, isActive = true } = options;
    const { page, limit, skip } = parsePagination(options, 50, 100);
    const where = { userId, deletedAt: null };

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    const [habits, total] = await Promise.all([
      prisma.habit.findMany({
        where,
        include: habitInclude,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.habit.count({ where }),
    ]);

    return { habits, ...buildPaginationMeta(total, page, limit) };
  },

  async create(data) {
    return prisma.habit.create({
      data,
      include: habitInclude,
    });
  },

  async update(id, userId, data) {
    return prisma.habit.update({
      where: { id, userId },
      data,
      include: habitInclude,
    });
  },

  async delete(id, userId) {
    return prisma.habit.update({
      where: { id, userId },
      data: { deletedAt: new Date(), isActive: false },
    });
  },

  async logCompletion(habitId, date, completed = true) {
    return prisma.habitLog.upsert({
      where: { habitId_date: { habitId, date } },
      update: { completed },
      create: { habitId, date, completed },
    });
  },

  async getLogs(habitId, startDate, endDate) {
    return prisma.habitLog.findMany({
      where: {
        habitId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  },

  async getStreaks(userId) {
    return prisma.habit.findMany({
      where: { userId, deletedAt: null, isActive: true },
      select: {
        id: true,
        title: true,
        type: true,
        streak: true,
        bestStreak: true,
        lastCompletedDate: true,
      },
    });
  },
};

module.exports = habitRepository;
