// ─── Task Controller ───────────────────────────────────────

const { taskService } = require('../services');
const { HTTP_STATUS } = require('../types');

const taskController = {
  async getAll(req, res, next) {
    try {
      const result = await taskService.getTasks(req.user.id, req.query);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const task = await taskService.getTask(req.params.id, req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const task = await taskService.createTask(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const task = await taskService.updateTask(req.params.id, req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.user.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },

  async toggleComplete(req, res, next) {
    try {
      const task = await taskService.completeTask(req.params.id, req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: task });
    } catch (error) {
      next(error);
    }
  },

  // Subtasks
  async addSubtask(req, res, next) {
    try {
      const subtask = await taskService.addSubtask(req.params.id, req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: subtask });
    } catch (error) {
      next(error);
    }
  },

  async updateSubtask(req, res, next) {
    try {
      const subtask = await taskService.updateSubtask(req.params.subtaskId, req.body);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: subtask });
    } catch (error) {
      next(error);
    }
  },

  async deleteSubtask(req, res, next) {
    try {
      await taskService.deleteSubtask(req.params.subtaskId);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },

  // Labels
  async createLabel(req, res, next) {
    try {
      const label = await taskService.createLabel(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: label });
    } catch (error) {
      next(error);
    }
  },

  async getLabels(req, res, next) {
    try {
      const labels = await taskService.getLabels(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: labels });
    } catch (error) {
      next(error);
    }
  },

  async assignLabel(req, res, next) {
    try {
      const { taskId, labelId } = req.params;
      const result = await taskService.assignLabel(taskId, labelId, req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  async removeLabel(req, res, next) {
    try {
      const { taskId, labelId } = req.params;
      await taskService.removeLabel(taskId, labelId, req.user.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = taskController;
