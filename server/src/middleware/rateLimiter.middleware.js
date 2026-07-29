const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Auth endpoints (login, register)
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many authentication attempts. Please try again later.' },
  },
});

/**
 * Rate Limiter for API code submission / execution endpoints
 */
const submissionRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 code submissions per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Rate limit exceeded for code submissions. Please wait a moment.' },
  },
});

module.exports = {
  authRateLimiter,
  submissionRateLimiter,
};
