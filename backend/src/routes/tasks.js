// ─── Task Routes ───────────────────────────────────────────

const { Router } = require('express');
const { taskController } = require('../controllers');
const { authenticate, validate, validateQuery } = require('../middleware');
const { tasks: taskValidators } = require('../validators');

const router = Router();

router.use(authenticate);

// Labels (must be before /:id routes to avoid route conflict)
router.get('/labels/all', taskController.getLabels);
router.post('/labels', validate(taskValidators.createTaskLabelSchema), taskController.createLabel);

// Tasks CRUD
router.get('/', validateQuery(taskValidators.taskQuerySchema), taskController.getAll);
router.get('/:id', validate(taskValidators.taskIdSchema, 'params'), taskController.getById);
router.post('/', validate(taskValidators.createTaskSchema), taskController.create);
router.patch('/:id', validate(taskValidators.taskIdSchema, 'params'), validate(taskValidators.updateTaskSchema), taskController.update);
router.delete('/:id', validate(taskValidators.taskIdSchema, 'params'), taskController.delete);

// Task actions
router.patch('/:id/toggle-complete', validate(taskValidators.taskIdSchema, 'params'), taskController.toggleComplete);

// Subtasks
router.post('/:id/subtasks', validate(taskValidators.taskIdSchema, 'params'), validate(taskValidators.createSubTaskSchema), taskController.addSubtask);
router.patch('/:id/subtasks/:subtaskId', taskController.updateSubtask);
router.delete('/:id/subtasks/:subtaskId', taskController.deleteSubtask);

// Label assignments (nested under /:id, safe after /:id routes)
router.post('/:id/labels/:labelId', validate(taskValidators.taskIdSchema, 'params'), taskController.assignLabel);
router.delete('/:id/labels/:labelId', validate(taskValidators.taskIdSchema, 'params'), taskController.removeLabel);

module.exports = router;
