// ─── Statistics Routes ─────────────────────────────────────

const { Router } = require('express');
const { statisticsController } = require('../controllers');
const { authenticate } = require('../middleware');

const router = Router();

router.use(authenticate);

router.get('/dashboard', statisticsController.getDashboard);
router.get('/daily', statisticsController.getDaily);
router.get('/weekly', statisticsController.getWeekly);
router.get('/monthly', statisticsController.getMonthly);
router.get('/range', statisticsController.getCustomRange);

module.exports = router;
