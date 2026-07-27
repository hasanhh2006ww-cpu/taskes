// ─── Controllers Barrel ────────────────────────────────────

const authController = require('./authController');
const taskController = require('./taskController');
const habitController = require('./habitController');
const habitCategoryController = require('./habitCategoryController');
const projectController = require('./projectController');
const calendarController = require('./calendarController');
const focusController = require('./focusController');
const notificationController = require('./notificationController');
const attachmentController = require('./attachmentController');
const statisticsController = require('./statisticsController');
const settingsController = require('./settingsController');

module.exports = {
  authController,
  taskController,
  habitController,
  habitCategoryController,
  projectController,
  calendarController,
  focusController,
  notificationController,
  attachmentController,
  statisticsController,
  settingsController,
};
