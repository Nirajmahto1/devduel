const router = require('express').Router();
const leaderboardController = require('../controllers/leaderboard.controller');

// GET /api/leaderboard — Public: Global / weekly leaderboard
router.get('/', leaderboardController.getLeaderboard);

module.exports = router;
