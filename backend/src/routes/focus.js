// ─── Focus / Pomodoro Routes ───────────────────────────────

const { Router } = require('express');
const { focusController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const { focus: focusValidators } = require('../validators');

const router = Router();

router.use(authenticate);

router.get('/', focusController.getAll);
router.get('/today', focusController.todayStats);
router.post('/', validate(focusValidators.createPomodoroSchema), focusController.create);
router.patch('/:id/complete', validate(focusValidators.completePomodoroSchema), focusController.complete);

module.exports = router;
