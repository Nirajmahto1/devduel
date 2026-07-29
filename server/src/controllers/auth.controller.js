const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'devduel_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Helper to generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Helper to sanitize user object (omit password_hash)
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...sanitized } = user;
  return sanitized;
}

/**
 * Register user with Email/Password
 */
async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Username, email, and password are required.' },
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        error: { message: 'Username must be between 3 and 30 characters.' },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 6 characters long.' },
      });
    }

    // Check duplicate email
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        error: { message: 'Email address is already registered.' },
      });
    }

    // Check duplicate username
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        error: { message: 'Username is already taken.' },
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.createUser({
      username,
      email,
      password_hash,
      oauth_provider: 'local',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 */
async function login(req, res, next) {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please provide email/username and password.' },
      });
    }

    let user = await User.findByEmail(identifier);
    if (!user) {
      user = await User.findByUsername(identifier);
    }

    if (!user || !user.password_hash) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials.' },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials.' },
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh JWT token
 */
async function refreshToken(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' },
      });
    }

    const token = generateToken(req.user);

    return res.status(200).json({
      success: true,
      data: {
        user: sanitizeUser(req.user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * OAuth Callback Handler
 */
async function oauthCallback(req, res) {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
    }

    const token = generateToken(req.user);
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/success?token=${token}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_error`);
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  oauthCallback,
  generateToken,
  sanitizeUser,
};
