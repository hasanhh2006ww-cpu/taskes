// ─── HabitCategory Service ─────────────────────────────────

const { habitCategoryRepository } = require('../repositories');
const { NotFoundError, ConflictError } = require('../lib/errors');
const prisma = require('../lib/prisma');
const logger = require('../lib/logger');

const habitCategoryService = {
  async getCategories(userId) {
    return habitCategoryRepository.findAll(userId);
  },

  async getCategory(id, userId) {
    const category = await habitCategoryRepository.findById(id, userId);
    if (!category) throw new NotFoundError('Habit category');
    return category;
  },

  async createCategory(userId, data) {
    // Check for duplicate name
    const existing = await prisma.habitCategory.findUnique({
      where: { name_userId: { name: data.name, userId } },
    });
    if (existing) {
      throw new ConflictError('A category with this name already exists');
    }
    const category = await habitCategoryRepository.create({ ...data, userId });
    logger.info('Habit category created', { categoryId: category.id, userId });
    return category;
  },

  async updateCategory(id, userId, data) {
    const existing = await habitCategoryRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Habit category');

    // Check for duplicate name if name is being changed
    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.habitCategory.findUnique({
        where: { name_userId: { name: data.name, userId } },
      });
      if (duplicate) {
        throw new ConflictError('A category with this name already exists');
      }
    }

    const category = await habitCategoryRepository.update(id, userId, data);
    logger.info('Habit category updated', { categoryId: id, userId });
    return category;
  },

  async deleteCategory(id, userId) {
    const existing = await habitCategoryRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Habit category');
    await habitCategoryRepository.delete(id, userId);
    logger.info('Habit category deleted', { categoryId: id, userId });
  },
};

module.exports = habitCategoryService;
