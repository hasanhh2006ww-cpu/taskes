// ─── Repositories Barrel ───────────────────────────────────

const userRepository = require('./userRepository');
const taskRepository = require('./taskRepository');
const habitRepository = require('./habitRepository');
const habitCategoryRepository = require('./habitCategoryRepository');
const projectRepository = require('./projectRepository');
const calendarRepository = require('./calendarRepository');
const notificationRepository = require('./notificationRepository');
const attachmentRepository = require('./attachmentRepository');
const statisticsRepository = require('./statisticsRepository');
const authRepository = require('./authRepository');

module.exports = {
  userRepository,
  taskRepository,
  habitRepository,
  habitCategoryRepository,
  projectRepository,
  calendarRepository,
  notificationRepository,
  attachmentRepository,
  statisticsRepository,
  authRepository,
};
