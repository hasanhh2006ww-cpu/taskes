// ─── Nodemailer Transporter ────────────────────────────────

const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../lib/logger');

let transporter = null;

/**
 * Initialize the email transporter
 */
function createTransporter() {
  if (transporter) return transporter;

  if (config.isDev && (!config.email.host || !config.email.user)) {
    logger.warn('Email credentials not configured, skipping email setup');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  // Verify connection
  transporter.verify((error) => {
    if (error) {
      logger.error('Email transporter verification failed', {
        error: error.message,
      });
      transporter = null;
    } else {
      logger.info('Email transporter ready');
    }
  });

  return transporter;
}

/**
 * Send an email
 */
async function sendEmail({ to, subject, html }) {
  const transport = createTransporter();
  if (!transport) {
    logger.warn('Email not sent (transporter not configured)', { to, subject });
    return { success: false, reason: 'transporter_not_configured' };
  }

  try {
    const info = await transport.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });
    logger.info('Email sent successfully', { to, subject, messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send email', { to, subject, error: error.message });
    throw error;
  }
}

module.exports = { createTransporter, sendEmail };
