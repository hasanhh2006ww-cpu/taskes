// ─── Auth Controller ───────────────────────────────────────

const { authService } = require('../services');
const { HTTP_STATUS } = require('../types');

const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(HTTP_STATUS.CREATED).json({
        status: 'success',
        message: 'Registration successful. Please verify your email.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyEmail(req, res, next) {
    try {
      const result = await authService.verifyEmail(req.query.token || req.body.token);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken;
      const result = await authService.logout(refreshToken);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: { user: req.user },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
