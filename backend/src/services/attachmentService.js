// ─── Attachment Service ────────────────────────────────────

const { attachmentRepository } = require('../repositories');
const { NotFoundError, ValidationError } = require('../lib/errors');
const { getStorage, validateFileType, validateFileSize, getMaxFileSize } = require('../lib/storage');
const logger = require('../lib/logger');

const attachmentService = {
  async getTaskAttachments(taskId, userId) {
    return attachmentRepository.findByTask(taskId, userId);
  },

  async uploadAttachment(taskId, userId, file) {
    // Validate file
    if (!file) {
      throw new ValidationError('No file provided');
    }

    if (!validateFileType(file.mimetype)) {
      throw new ValidationError(
        `File type "${file.mimetype}" not allowed. Allowed types: ${getAllowedTypesString()}`
      );
    }

    if (!validateFileSize(file.size)) {
      const maxMB = Math.round(getMaxFileSize() / (1024 * 1024));
      throw new ValidationError(`File size exceeds maximum of ${maxMB} MB`);
    }

    // Save to storage
    const storage = getStorage();
    const fileName = await storage.save(file.originalname, file.buffer);

    // Store metadata in database
    const attachment = await attachmentRepository.create({
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      url: storage.getUrl(fileName),
      taskId,
      userId,
    });

    logger.info('Attachment uploaded', {
      attachmentId: attachment.id,
      taskId,
      userId,
      fileName: file.originalname,
      fileSize: file.size,
    });

    return attachment;
  },

  async deleteAttachment(id, userId) {
    const attachment = await attachmentRepository.findById(id, userId);
    if (!attachment) throw new NotFoundError('Attachment');

    // Delete from storage
    const storage = getStorage();
    // Extract the stored path from the url
    const storedPath = attachment.url.replace('/uploads/', '');
    await storage.delete(storedPath);

    // Delete from database
    await attachmentRepository.delete(id, userId);

    logger.info('Attachment deleted', { attachmentId: id, userId });
  },

  async deleteTaskAttachments(taskId, userId) {
    const attachments = await attachmentRepository.findByTask(taskId, userId);
    const storage = getStorage();

    for (const attachment of attachments) {
      const storedPath = attachment.url.replace('/uploads/', '');
      try {
        await storage.delete(storedPath);
      } catch (error) {
        logger.warn('Failed to delete attachment file', {
          attachmentId: attachment.id,
          error: error.message,
        });
      }
    }

    await attachmentRepository.deleteByTask(taskId, userId);
    logger.info('All task attachments deleted', { taskId, userId, count: attachments.length });
  },
};

const MIME_TO_EXT = {
  'image/jpeg': '.jpg,.jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/zip': '.zip',
  'application/json': '.json',
};

function getAllowedTypesString() {
  return Object.values(MIME_TO_EXT).join(', ');
}

module.exports = attachmentService;
