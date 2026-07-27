// ─── Routes Barrel ─────────────────────────────────────────

const { Router } = require('express');
const config = require('../config');
const { apiLimiter } = require('../middleware');

const authRoutes = require('./auth');
const taskRoutes = require('./tasks');
const habitRoutes = require('./habits');
const habitCategoryRoutes = require('./habitCategories');
const projectRoutes = require('./projects');
const calendarRoutes = require('./calendar');
const focusRoutes = require('./focus');
const notificationRoutes = require('./notifications');
const attachmentRoutes = require('./attachments');
const statisticsRoutes = require('./statistics');
const settingsRoutes = require('./settings');

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// Apply rate limiting to all API routes
router.use(apiLimiter);

// Mount routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/habits', habitRoutes);
router.use('/habit-categories', habitCategoryRoutes);
router.use('/projects', projectRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/calendar', calendarRoutes);
router.use('/focus', focusRoutes);
router.use('/notifications', notificationRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
