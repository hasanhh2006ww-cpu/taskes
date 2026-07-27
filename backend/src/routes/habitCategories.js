// ─── HabitCategory Routes ──────────────────────────────────

const { Router } = require('express');
const { habitCategoryController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const { habitCategories: categoryValidators } = require('../validators');

const router = Router();

router.use(authenticate);

router.get('/', habitCategoryController.getAll);
router.get('/:id', validate(categoryValidators.habitCategoryIdSchema, 'params'), habitCategoryController.getById);
router.post('/', validate(categoryValidators.createHabitCategorySchema), habitCategoryController.create);
router.patch('/:id', validate(categoryValidators.habitCategoryIdSchema, 'params'), validate(categoryValidators.updateHabitCategorySchema), habitCategoryController.update);
router.delete('/:id', validate(categoryValidators.habitCategoryIdSchema, 'params'), habitCategoryController.delete);

module.exports = router;
