const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/users/me — Protected: Get current profile
router.get('/me', authenticate, userController.getProfile);

// PATCH /api/users/me — Protected: Update profile
router.patch('/me', authenticate, userController.updateProfile);

// GET /api/users/:id — Public: Get user profile by ID or username
router.get('/:id', userController.getPublicProfile);

// GET /api/users/:id/matches — Public: Get user's match history
router.get('/:id/matches', userController.getUserMatches);

module.exports = router;
