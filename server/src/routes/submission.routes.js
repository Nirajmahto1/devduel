const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/submissions — submit code for judging
router.post('/', authenticate, async (req, res) => {
  // TODO: Send code to Judge0 and return verdict
  res.status(501).json({ message: 'Submit code — not implemented yet' });
});

// GET /api/submissions/:id — submission detail
router.get('/:id', authenticate, async (req, res) => {
  // TODO: Return submission verdict & details
  res.status(501).json({ message: 'Submission detail — not implemented yet' });
});

module.exports = router;
