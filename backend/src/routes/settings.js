// ─── Settings Routes ───────────────────────────────────────

const { Router } = require('express');
const { settingsController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const { settings: settingsValidators } = require('../validators');

const router = Router();

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.patch('/', validate(settingsValidators.updateSettingsSchema), settingsController.updateSettings);
router.patch('/profile', validate(settingsValidators.updateProfileSchema), settingsController.updateProfile);
router.post('/change-password', validate(settingsValidators.changePasswordSchema), settingsController.changePassword);
router.delete('/account', settingsController.deleteAccount);

module.exports = router;
