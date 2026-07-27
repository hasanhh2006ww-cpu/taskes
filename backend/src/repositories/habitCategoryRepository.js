// ─── HabitCategory Repository ──────────────────────────────

const prisma = require('../lib/prisma');

const categoryInclude = {
  _count: { select: { habits: true } },
};

const habitCategoryRepository = {
  async findById(id, userId) {
    return prisma.habitCategory.findFirst({
      where: { id, userId },
      include: categoryInclude,
    });
  },

  async findAll(userId) {
    const categories = await prisma.habitCategory.findMany({
      where: { userId },
      include: {
        ...categoryInclude,
        habits: {
          where: { deletedAt: null, isActive: true },
          select: { id: true, title: true, type: true, color: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return categories;
  },

  async create(data) {
    return prisma.habitCategory.create({
      data,
      include: categoryInclude,
    });
  },

  async update(id, userId, data) {
    return prisma.habitCategory.update({
      where: { id, userId },
      data,
      include: categoryInclude,
    });
  },

  async delete(id, userId) {
    // Remove category reference from habits first, then delete
    await prisma.habit.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    return prisma.habitCategory.delete({
      where: { id, userId },
    });
  },
};

module.exports = habitCategoryRepository;
