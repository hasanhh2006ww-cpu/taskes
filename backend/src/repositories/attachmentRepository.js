// ─── Attachment Repository ─────────────────────────────────

const prisma = require('../lib/prisma');

const attachmentRepository = {
  async findById(id, userId) {
    return prisma.attachment.findFirst({
      where: { id, userId },
    });
  },

  async findByTask(taskId, userId) {
    return prisma.attachment.findMany({
      where: { taskId, userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data) {
    return prisma.attachment.create({ data });
  },

  async delete(id, userId) {
    return prisma.attachment.delete({
      where: { id, userId },
    });
  },

  async deleteByTask(taskId, userId) {
    return prisma.attachment.deleteMany({
      where: { taskId, userId },
    });
  },
};

module.exports = attachmentRepository;
