// ─── Attachment Controller ─────────────────────────────────

const { attachmentService } = require('../services');
const { HTTP_STATUS } = require('../types');

const attachmentController = {
  async getTaskAttachments(req, res, next) {
    try {
      const attachments = await attachmentService.getTaskAttachments(req.params.taskId, req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', data: attachments });
    } catch (error) {
      next(error);
    }
  },

  async upload(req, res, next) {
    try {
      const file = req.file;
      const attachment = await attachmentService.uploadAttachment(
        req.params.taskId,
        req.user.id,
        file
      );
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: attachment });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await attachmentService.deleteAttachment(req.params.id, req.user.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = attachmentController;
