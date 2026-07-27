// ─── Calendar Routes ───────────────────────────────────────

const { Router } = require('express');
const { calendarController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const { calendar: calendarValidators } = require('../validators');

const router = Router();

router.use(authenticate);

router.get('/', calendarController.getAll);
router.get('/month', calendarController.getMonth);
router.get('/:id', validate(calendarValidators.eventIdSchema, 'params'), calendarController.getById);
router.post('/', validate(calendarValidators.createEventSchema), calendarController.create);
router.patch('/:id', validate(calendarValidators.eventIdSchema, 'params'), validate(calendarValidators.updateEventSchema), calendarController.update);
router.delete('/:id', validate(calendarValidators.eventIdSchema, 'params'), calendarController.delete);

module.exports = router;
