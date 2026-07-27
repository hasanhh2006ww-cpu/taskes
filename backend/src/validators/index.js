// ─── Validators Barrel ─────────────────────────────────────

const auth = require('./auth');
const tasks = require('./tasks');
const habits = require('./habits');
const habitCategories = require('./habitCategories');
const projects = require('./projects');
const calendar = require('./calendar');
const focus = require('./focus');
const attachments = require('./attachments');
const settings = require('./settings');

module.exports = {
  auth,
  tasks,
  habits,
  habitCategories,
  projects,
  calendar,
  focus,
  attachments,
  settings,
};
