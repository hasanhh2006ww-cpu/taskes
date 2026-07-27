// ─── Notification Routes ───────────────────────────────────

const { Router } = require('express');
const { notificationController } = require('../controllers');
const { authenticate } = require('../middleware');

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getAll);
router.get('/unread-count', notificationController.getUnreadCount);

// Bulk actions (must be before /:id routes)
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/', notificationController.deleteAll);

// Single item actions
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.delete);

module.exports = router;
