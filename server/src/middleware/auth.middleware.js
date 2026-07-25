const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

/**
 * Protect routes — verify JWT token
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: 'Access denied. No token provided.' },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db('users').where({ id: decoded.id }).first();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not found.' },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token.' },
    });
  }
}

/**
 * Admin-only access
 */
function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Admin access required.' },
    });
  }
  next();
}

module.exports = { authenticate, authorizeAdmin };
