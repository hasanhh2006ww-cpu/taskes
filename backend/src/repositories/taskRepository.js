// ─── Task Repository ───────────────────────────────────────

const prisma = require('../lib/prisma');
const { buildPaginationMeta, parsePagination, parseSort } = require('../utils/pagination');

const taskInclude = {
  subtasks: { orderBy: { order: 'asc' } },
  labels: { include: { label: true } },
  activity: { orderBy: { timestamp: 'desc' }, take: 10 },
  project: { select: { id: true, name: true, color: true, icon: true } },
};

const taskRepository = {
  async findById(id, userId) {
    return prisma.task.findFirst({
      where: { id, userId, deletedAt: null },
      include: taskInclude,
    });
  },

  async findAll(userId, options = {}) {
    const {
      filter = 'all',
      priority,
      category,
      projectId,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where = { userId, deletedAt: null };

    // Filter
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.dueDate = { gte: today, lt: tomorrow };
    } else if (filter === 'upcoming') {
      where.dueDate = { gte: new Date() };
      where.completed = false;
    } else if (filter === 'completed') {
      where.completed = true;
    } else if (filter === 'archived') {
      where.archived = true;
    }

    // Optional filters
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (projectId) where.projectId = projectId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const { skip, limit: normalizedLimit } = parsePagination(options, 20, 100);
    const { sortBy: sBy, sortOrder: sOrder } = parseSort(options, 'createdAt', 'desc');

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: { [sBy]: sOrder },
        skip,
        take: normalizedLimit,
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, ...buildPaginationMeta(total, page, normalizedLimit) };
  },

  async create(data) {
    return prisma.task.create({
      data,
      include: taskInclude,
    });
  },

  async update(id, userId, data) {
    return prisma.task.update({
      where: { id, userId },
      data,
      include: taskInclude,
    });
  },

  async delete(id, userId) {
    return prisma.task.update({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  },

  async permanentDelete(id, userId) {
    return prisma.task.delete({ where: { id, userId } });
  },

  async reorder(id, userId, newOrder) {
    return prisma.task.update({
      where: { id, userId },
      data: { order: newOrder },
    });
  },

  async getTodayCount(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.task.count({
      where: {
        userId,
        deletedAt: null,
        dueDate: { gte: today, lt: tomorrow },
      },
    });
  },

  async getOverdueCount(userId) {
    return prisma.task.count({
      where: {
        userId,
        deletedAt: null,
        completed: false,
        dueDate: { lt: new Date() },
      },
    });
  },

  // Subtasks
  async addSubtask(taskId, data) {
    return prisma.subTask.create({
      data: { ...data, taskId },
    });
  },

  async updateSubtask(id, data) {
    return prisma.subTask.update({ where: { id }, data });
  },

  async deleteSubtask(id) {
    return prisma.subTask.delete({ where: { id } });
  },

  // Labels
  async createLabel(data) {
    return prisma.taskLabel.create({ data });
  },

  async getLabels(userId) {
    return prisma.taskLabel.findMany({
      where: { userId },
      include: { _count: { select: { tasks: true } } },
    });
  },

  async assignLabel(taskId, labelId) {
    return prisma.taskLabelAssignment.create({
      data: { taskId, labelId },
    });
  },

  async removeLabel(taskId, labelId) {
    return prisma.taskLabelAssignment.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
  },
};

module.exports = taskRepository;
