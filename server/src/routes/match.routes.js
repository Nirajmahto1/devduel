const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/matches/:id — match details
router.get('/:id', authenticate, async (req, res) => {
  // TODO: Return match details, players, result
  res.status(501).json({ message: 'Match detail — not implemented yet' });
});

// POST /api/matches/private — create private room
router.post('/private', authenticate, async (req, res) => {
  // TODO: Create a private duel room with invite code
  res.status(501).json({ message: 'Create private room — not implemented yet' });
});

// POST /api/matches/:id/join — join via invite code
router.post('/:id/join', authenticate, async (req, res) => {
  // TODO: Join private room
  res.status(501).json({ message: 'Join room — not implemented yet' });
});

module.exports = router;
