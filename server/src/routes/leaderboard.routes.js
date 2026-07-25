const router = require('express').Router();

// GET /api/leaderboard — global leaderboard
router.get('/', async (req, res) => {
  // TODO: Return paginated leaderboard sorted by rating
  // Query params: ?period=all|weekly  &limit=50  &offset=0
  res.status(501).json({ message: 'Leaderboard — not implemented yet' });
});

module.exports = router;
