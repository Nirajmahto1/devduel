const router = require('express').Router();
const matchController = require('../controllers/match.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/matches/private — Protected: Create private room with invite code
router.post('/private', authenticate, matchController.createPrivateRoom);

// POST /api/matches/join — Protected: Join via invite code in body
router.post('/join', authenticate, matchController.joinPrivateRoom);

// POST /api/matches/:id/join — Protected: Join via invite code / match ID in URL
router.post('/:id/join', authenticate, matchController.joinPrivateRoom);

// GET /api/matches/:id — Protected: Match details & results
router.get('/:id', authenticate, matchController.getMatchDetails);

module.exports = router;
