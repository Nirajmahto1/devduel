const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/users/me — current user profile
router.get('/me', authenticate, async (req, res) => {
  // TODO: Return current user profile
  res.json({ user: req.user });
});

// GET /api/users/:id — public profile
router.get('/:id', async (req, res) => {
  // TODO: Return public user profile
  res.status(501).json({ message: 'User profile — not implemented yet' });
});

// PATCH /api/users/me — update profile
router.patch('/me', authenticate, async (req, res) => {
  // TODO: Update user profile
  res.status(501).json({ message: 'Update profile — not implemented yet' });
});

// GET /api/users/:id/matches — user match history
router.get('/:id/matches', async (req, res) => {
  // TODO: Return match history
  res.status(501).json({ message: 'Match history — not implemented yet' });
});

module.exports = router;
