// ─── Attachment Routes ─────────────────────────────────────

const { Router } = require('express');
const multer = require('multer');
const { attachmentController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const { attachments: attachmentValidators } = require('../validators');
const { getMaxFileSize } = require('../lib/storage');

// Multer in-memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: getMaxFileSize() },
});

const router = Router();

router.use(authenticate);

// List attachments for a task
router.get(
  '/tasks/:taskId',
  validate(attachmentValidators.taskIdParamSchema, 'params'),
  attachmentController.getTaskAttachments
);

// Upload attachment to a task
router.post(
  '/tasks/:taskId',
  validate(attachmentValidators.taskIdParamSchema, 'params'),
  upload.single('file'),
  attachmentController.upload
);

// Delete attachment
router.delete(
  '/:id',
  validate(attachmentValidators.attachmentIdSchema, 'params'),
  attachmentController.delete
);

module.exports = router;
