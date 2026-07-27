// ─── Calendar Event Repository ─────────────────────────────

const prisma = require('../lib/prisma');
const { buildPaginationMeta, parsePagination } = require('../utils/pagination');

const eventInclude = {
  task: { select: { id: true, title: true, completed: true, priority: true } },
  habit: { select: { id: true, title: true, type: true, color: true } },
};

const calendarRepository = {
  async findById(id, userId) {
    return prisma.calendarEvent.findFirst({
      where: { id, userId },
      include: eventInclude,
    });
  },

  async findAll(userId, options = {}) {
    const { startDate, endDate, type } = options;
    const { page, limit, skip } = parsePagination(options, 50, 100);
    const where = { userId };

    if (startDate) where.date = { ...(where.date || {}), gte: new Date(startDate) };
    if (endDate) where.date = { ...(where.date || {}), lte: new Date(endDate) };
    if (type) where.type = type;

    const [events, total] = await Promise.all([
      prisma.calendarEvent.findMany({
        where,
        include: eventInclude,
        orderBy: { date: 'asc' },
        skip,
        take: limit,
      }),
      prisma.calendarEvent.count({ where }),
    ]);

    return { events, ...buildPaginationMeta(total, page, limit) };
  },

  async create(data) {
    return prisma.calendarEvent.create({
      data,
      include: eventInclude,
    });
  },

  async update(id, userId, data) {
    return prisma.calendarEvent.update({
      where: { id, userId },
      data,
      include: eventInclude,
    });
  },

  async delete(id, userId) {
    return prisma.calendarEvent.delete({
      where: { id, userId },
    });
  },

  async getMonthEvents(userId, year, month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    return prisma.calendarEvent.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      include: eventInclude,
      orderBy: { date: 'asc' },
    });
  },
};

module.exports = calendarRepository;
