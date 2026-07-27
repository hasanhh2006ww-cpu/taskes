// ─── Project Repository ────────────────────────────────────

const prisma = require('../lib/prisma');

const projectRepository = {
  async findById(id, userId) {
    return prisma.project.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        _count: { select: { tasks: true } },
      },
    });
  },

  async findAll(userId, includeInactive = false) {
    const where = { userId, deletedAt: null };
    if (!includeInactive) {
      where.isActive = true;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with progress
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await prisma.task.count({
          where: { projectId: project.id, deletedAt: null },
        });
        const completedTasks = await prisma.task.count({
          where: { projectId: project.id, deletedAt: null, completed: true },
        });
        return {
          ...project,
          progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          totalTasks,
          completedTasks,
        };
      })
    );

    return enriched;
  },

  async create(data) {
    return prisma.project.create({
      data,
      include: { _count: { select: { tasks: true } } },
    });
  },

  async update(id, userId, data) {
    return prisma.project.update({
      where: { id, userId },
      data,
    });
  },

  async delete(id, userId) {
    return prisma.project.update({
      where: { id, userId },
      data: { deletedAt: new Date(), isActive: false },
    });
  },
};

module.exports = projectRepository;
