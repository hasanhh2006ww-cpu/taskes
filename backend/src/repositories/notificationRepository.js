// ─── Notification Repository ───────────────────────────────

const prisma = require('../lib/prisma');
const { buildPaginationMeta, parsePagination } = require('../utils/pagination');

const notificationRepository = {
  async findById(id, userId) {
    return prisma.notification.findFirst({
      where: { id, userId },
    });
  },

  async findAll(userId, options = {}) {
    const { unreadOnly = false } = options;
    const { page, limit, skip } = parsePagination(options, 20, 100);
    const where = { userId };

    if (unreadOnly) {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return { notifications, unreadCount, ...buildPaginationMeta(total, page, limit) };
  },

  async create(data) {
    return prisma.notification.create({ data });
  },

  async createMany(dataArray) {
    return prisma.notification.createMany({ data: dataArray });
  },

  async markAsRead(id, userId) {
    return prisma.notification.update({
      where: { id, userId },
      data: { read: true },
    });
  },

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  async delete(id, userId) {
    return prisma.notification.delete({
      where: { id, userId },
    });
  },

  async deleteAll(userId) {
    return prisma.notification.deleteMany({ where: { userId } });
  },

  async getUnreadCount(userId) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  },
};

module.exports = notificationRepository;
