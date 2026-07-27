// ─── Authentication Service ────────────────────────────────

const { hashPassword, comparePassword } = require('../lib/crypto');
const { generateAccessToken, generateRefreshToken, generateCryptoToken, getTokenExpiry, verifyRefreshToken } = require('../lib/tokens');
const { sendEmail } = require('../email/transporter');
const { verifyEmail: verifyEmailTemplate, resetPassword: resetPasswordTemplate, welcomeEmail: welcomeEmailTemplate } = require('../email/templates');
const { userRepository, authRepository } = require('../repositories');
const { ConflictError, UnauthorizedError, NotFoundError, AppError } = require('../lib/errors');
const prisma = require('../lib/prisma');
const logger = require('../lib/logger');

const authService = {
  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    // Check if email already exists
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create default settings
    await prisma.userSettings.create({
      data: { userId: user.id },
    });

    // Generate email verification token
    const verificationToken = generateCryptoToken();
    const expiresAt = getTokenExpiry(24);

    await authRepository.createEmailVerificationToken({
      token: verificationToken,
      userId: user.id,
      expiresAt,
    });

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'تأكيد البريد الإلكتروني - My Taske',
        html: verifyEmailTemplate({ name, token: verificationToken }),
      });
      logger.info('Verification email sent', { userId: user.id });
    } catch (error) {
      logger.warn('Failed to send verification email', { error: error.message });
    }

    return { user };
  },

  /**
   * Login with email and password
   */
  async login({ email, password, rememberMe = false }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if active
    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    // Check password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check email verification
    if (!user.emailVerified) {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({
      ...tokenPayload,
      type: 'refresh',
    });

    // Store refresh token
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000);
    await authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      deviceInfo: rememberMe ? 'remember-me' : null,
    });

    // Update last login
    await userRepository.update(user.id, { lastLoginAt: new Date(), rememberMe });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
      expiresAt,
    };
  },

  /**
   * Refresh access token
   */
  async refreshToken(token) {
    // Verify JWT
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Check in database
    const storedToken = await authRepository.findRefreshToken(token);
    if (!storedToken || storedToken.revoked) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Generate new tokens
    const tokenPayload = { userId: decoded.userId, email: decoded.email };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken({
      ...tokenPayload,
      type: 'refresh',
    });

    // Revoke old and create new
    await authRepository.revokeRefreshToken(storedToken.id);
    await authRepository.createRefreshToken({
      token: newRefreshToken,
      userId: decoded.userId,
      expiresAt: storedToken.expiresAt,
    });

    // Get user
    const user = await userRepository.findById(decoded.userId);

    return {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    const record = await authRepository.findEmailVerificationToken(token);
    if (!record) {
      throw new NotFoundError('Verification token not found');
    }

    if (record.usedAt) {
      throw new AppError('Token has already been used', 400);
    }

    if (new Date() > record.expiresAt) {
      throw new AppError('Verification token has expired', 400);
    }

    // Mark token as used and verify user
    await Promise.all([
      authRepository.useEmailVerificationToken(record.id),
      userRepository.update(record.user.id, { emailVerified: true }),
    ]);

    // Send welcome email
    try {
      await sendEmail({
        to: record.user.email,
        subject: 'أهلاً بك في My Taske! 🎉',
        html: welcomeEmailTemplate({ name: record.user.name }),
      });
    } catch (error) {
      logger.warn('Failed to send welcome email', { error: error.message });
    }

    return { message: 'Email verified successfully' };
  },

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal whether the email exists
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Revoke old tokens
    await authRepository.revokeUserPasswordTokens(user.id);

    // Create new reset token
    const resetToken = generateCryptoToken();
    const expiresAt = getTokenExpiry(1);

    await authRepository.createPasswordResetToken({
      token: resetToken,
      userId: user.id,
      expiresAt,
    });

    // Send reset email
    try {
      await sendEmail({
        to: email,
        subject: 'إعادة تعيين كلمة المرور - My Taske',
        html: resetPasswordTemplate({ name: user.name, token: resetToken }),
      });
      logger.info('Password reset email sent', { userId: user.id });
    } catch (error) {
      logger.warn('Failed to send password reset email', { error: error.message });
    }

    return { message: 'If the email exists, a password reset link has been sent' };
  },

  /**
   * Reset password with token
   */
  async resetPassword({ token, password }) {
    const record = await authRepository.findPasswordResetToken(token);
    if (!record) {
      throw new NotFoundError('Reset token not found');
    }

    if (record.usedAt) {
      throw new AppError('Token has already been used', 400);
    }

    if (new Date() > record.expiresAt) {
      throw new AppError('Reset token has expired', 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and mark token as used
    await Promise.all([
      userRepository.update(record.user.id, { password: hashedPassword }),
      authRepository.usePasswordResetToken(record.id),
      authRepository.revokeUserRefreshTokens(record.user.id),
    ]);

    return { message: 'Password has been reset successfully' };
  },

  /**
   * Logout - revoke refresh token
   */
  async logout(refreshToken) {
    if (refreshToken) {
      const stored = await authRepository.findRefreshToken(refreshToken);
      if (stored) {
        await authRepository.revokeRefreshToken(stored.id);
      }
    }
    return { message: 'Logged out successfully' };
  },

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens() {
    await authRepository.cleanupExpiredTokens();
    logger.info('Expired tokens cleaned up');
  },
};

module.exports = authService;
