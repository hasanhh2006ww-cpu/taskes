// ─── HabitCategory Controller ──────────────────────────────

const { habitCategoryService } = require('../services');
const { HTTP_STATUS } = require('../types');

const habitCategoryController = {
  async getAll(req, res, next) {
    try {
      const categories = await habitCategoryService.getCategories(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: categories });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const category = await habitCategoryService.getCategory(req.params.id, req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const category = await habitCategoryService.createCategory(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const category = await habitCategoryService.updateCategory(req.params.id, req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await habitCategoryService.deleteCategory(req.params.id, req.user.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = habitCategoryController;
