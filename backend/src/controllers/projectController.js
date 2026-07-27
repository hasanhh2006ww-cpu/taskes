// ─── Project Controller ────────────────────────────────────

const { projectService } = require('../services');
const { HTTP_STATUS } = require('../types');

const projectController = {
  async getAll(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const projects = await projectService.getProjects(req.user.id, includeInactive);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: projects });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const project = await projectService.getProject(req.params.id, req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: project });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const project = await projectService.createProject(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: project });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const project = await projectService.updateProject(req.params.id, req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: project });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await projectService.deleteProject(req.params.id, req.user.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = projectController;
