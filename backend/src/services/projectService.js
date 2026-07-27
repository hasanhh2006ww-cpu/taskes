// ─── Project Service ───────────────────────────────────────

const { projectRepository } = require('../repositories');
const { NotFoundError } = require('../lib/errors');
const logger = require('../lib/logger');

const projectService = {
  async getProjects(userId, includeInactive = false) {
    return projectRepository.findAll(userId, includeInactive);
  },

  async getProject(id, userId) {
    const project = await projectRepository.findById(id, userId);
    if (!project) throw new NotFoundError('Project');
    return project;
  },

  async createProject(userId, data) {
    const project = await projectRepository.create({ ...data, userId });
    logger.info('Project created', { projectId: project.id, userId });
    return project;
  },

  async updateProject(id, userId, data) {
    const existing = await projectRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Project');

    const project = await projectRepository.update(id, userId, data);
    logger.info('Project updated', { projectId: id, userId });
    return project;
  },

  async deleteProject(id, userId) {
    const existing = await projectRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Project');
    await projectRepository.delete(id, userId);
    logger.info('Project deleted', { projectId: id, userId });
  },
};

module.exports = projectService;
