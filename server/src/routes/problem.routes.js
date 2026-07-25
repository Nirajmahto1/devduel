const router = require('express').Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

// GET /api/problems — list problems (paginated, filterable)
router.get('/', async (req, res) => {
  // TODO: Return paginated problem list with filters (difficulty, tags)
  res.status(501).json({ message: 'List problems — not implemented yet' });
});

// GET /api/problems/:id — single problem detail
router.get('/:id', async (req, res) => {
  // TODO: Return problem with description (without test case answers)
  res.status(501).json({ message: 'Problem detail — not implemented yet' });
});

// POST /api/problems — create problem (admin only)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  // TODO: Create a new problem with test cases
  res.status(501).json({ message: 'Create problem — not implemented yet' });
});

// PUT /api/problems/:id — update problem (admin only)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  // TODO: Update problem
  res.status(501).json({ message: 'Update problem — not implemented yet' });
});

// DELETE /api/problems/:id — delete problem (admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  // TODO: Delete problem
  res.status(501).json({ message: 'Delete problem — not implemented yet' });
});

module.exports = router;
