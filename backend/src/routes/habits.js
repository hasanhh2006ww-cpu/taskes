// ─── Habit Routes ──────────────────────────────────────────

const { Router } = require('express');
const { habitController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const { habits: habitValidators } = require('../validators');

const router = Router();

router.use(authenticate);

// Streaks
router.get('/streaks', habitController.getStreaks);

// Habits CRUD
router.get('/', habitController.getAll);
router.get('/:id', validate(habitValidators.habitIdSchema, 'params'), habitController.getById);
router.post('/', validate(habitValidators.createHabitSchema), habitController.create);
router.patch('/:id', validate(habitValidators.habitIdSchema, 'params'), validate(habitValidators.updateHabitSchema), habitController.update);
router.delete('/:id', validate(habitValidators.habitIdSchema, 'params'), habitController.delete);

// Completion
router.post('/:id/log', validate(habitValidators.habitIdSchema, 'params'), validate(habitValidators.habitLogSchema), habitController.logCompletion);
router.get('/:id/logs', validate(habitValidators.habitIdSchema, 'params'), habitController.getLogs);

module.exports = router;
