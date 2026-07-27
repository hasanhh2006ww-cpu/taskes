// ─── Structured Logger ─────────────────────────────────────

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function timestamp() {
  return new Date().toISOString();
}

function formatMessage(level, message, meta) {
  const base = `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    return `${base} ${JSON.stringify(meta)}`;
  }
  return base;
}

const logger = {
  error(message, meta) {
    if (currentLevel >= LEVELS.error) {
      console.error(formatMessage('error', message, meta));
    }
  },
  warn(message, meta) {
    if (currentLevel >= LEVELS.warn) {
      console.warn(formatMessage('warn', message, meta));
    }
  },
  info(message, meta) {
    if (currentLevel >= LEVELS.info) {
      console.log(formatMessage('info', message, meta));
    }
  },
  debug(message, meta) {
    if (currentLevel >= LEVELS.debug) {
      console.log(formatMessage('debug', message, meta));
    }
  },
};

module.exports = logger;
