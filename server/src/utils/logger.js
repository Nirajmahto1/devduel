/**
 * Simple structured logger for DevDuel
 * Replace with winston/pino in production if needed.
 */

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info;

function formatTimestamp() {
  return new Date().toISOString();
}

function log(level, ...args) {
  if (LOG_LEVELS[level] <= currentLevel) {
    const prefix = `[${formatTimestamp()}] [${level.toUpperCase()}]`;
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](prefix, ...args);
  }
}

module.exports = {
  info: (...args) => log('info', ...args),
  warn: (...args) => log('warn', ...args),
  error: (...args) => log('error', ...args),
  debug: (...args) => log('debug', ...args),
};
