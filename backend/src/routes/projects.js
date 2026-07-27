// ─── Project Routes ────────────────────────────────────────

const { Router } = require('express');
const { projectController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const { projects: projectValidators } = require('../validators');

const router = Router();

router.use(authenticate);

router.get('/', projectController.getAll);
router.get('/:id', validate(projectValidators.projectIdSchema, 'params'), projectController.getById);
router.post('/', validate(projectValidators.createProjectSchema), projectController.create);
router.patch('/:id', validate(projectValidators.projectIdSchema, 'params'), validate(projectValidators.updateProjectSchema), projectController.update);
router.delete('/:id', validate(projectValidators.projectIdSchema, 'params'), projectController.delete);

module.exports = router;
