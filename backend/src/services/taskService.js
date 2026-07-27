// ─── Task Service ──────────────────────────────────────────

const { taskRepository } = require('../repositories');
const { NotFoundError } = require('../lib/errors');
const logger = require('../lib/logger');

const taskService = {
  async getTasks(userId, query) {
    return taskRepository.findAll(userId, query);
  },

  async getTask(id, userId) {
    const task = await taskRepository.findById(id, userId);
    if (!task) throw new NotFoundError('Task');
    return task;
  },

  async createTask(userId, data) {
    const task = await taskRepository.create({
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
      userId,
    });
    logger.info('Task created', { taskId: task.id, userId });
    return task;
  },

  async updateTask(id, userId, data) {
    const existing = await taskRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Task');

    const updateData = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.reminderAt) updateData.reminderAt = new Date(data.reminderAt);
    if (data.completed && !existing.completed) {
      updateData.completedAt = new Date();
    }

    const task = await taskRepository.update(id, userId, updateData);
    logger.info('Task updated', { taskId: id, userId });
    return task;
  },

  async deleteTask(id, userId) {
    const existing = await taskRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Task');
    await taskRepository.delete(id, userId);
    logger.info('Task deleted', { taskId: id, userId });
  },

  async completeTask(id, userId) {
    const existing = await taskRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Task');
    return taskRepository.update(id, userId, {
      completed: !existing.completed,
      completedAt: !existing.completed ? new Date() : null,
    });
  },

  // Subtasks
  async addSubtask(taskId, userId, data) {
    const existing = await taskRepository.findById(taskId, userId);
    if (!existing) throw new NotFoundError('Task');
    return taskRepository.addSubtask(taskId, data);
  },

  async updateSubtask(subtaskId, data) {
    return taskRepository.updateSubtask(subtaskId, data);
  },

  async deleteSubtask(subtaskId) {
    return taskRepository.deleteSubtask(subtaskId);
  },

  // Labels
  async createLabel(userId, data) {
    return taskRepository.createLabel({ ...data, userId });
  },

  async getLabels(userId) {
    return taskRepository.getLabels(userId);
  },

  async assignLabel(taskId, labelId, userId) {
    const task = await taskRepository.findById(taskId, userId);
    if (!task) throw new NotFoundError('Task');
    return taskRepository.assignLabel(taskId, labelId);
  },

  async removeLabel(taskId, labelId, userId) {
    const task = await taskRepository.findById(taskId, userId);
    if (!task) throw new NotFoundError('Task');
    return taskRepository.removeLabel(taskId, labelId);
  },
};

module.exports = taskService;
