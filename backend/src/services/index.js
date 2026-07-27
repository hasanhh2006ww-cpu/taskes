// ─── Services Barrel ───────────────────────────────────────

const authService = require('./authService');
const taskService = require('./taskService');
const habitService = require('./habitService');
const habitCategoryService = require('./habitCategoryService');
const projectService = require('./projectService');
const calendarService = require('./calendarService');
const focusService = require('./focusService');
const notificationService = require('./notificationService');
const attachmentService = require('./attachmentService');
const statisticsService = require('./statisticsService');
const settingsService = require('./settingsService');

module.exports = {
  authService,
  taskService,
  habitService,
  habitCategoryService,
  projectService,
  calendarService,
  focusService,
  notificationService,
  attachmentService,
  statisticsService,
  settingsService,
};
