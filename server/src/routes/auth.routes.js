const router = require('express').Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  // TODO: Implement registration
  res.status(501).json({ message: 'Register — not implemented yet' });
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  // TODO: Implement login
  res.status(501).json({ message: 'Login — not implemented yet' });
});

// GET /api/auth/google
router.get('/google', (req, res) => {
  // TODO: Passport Google OAuth
  res.status(501).json({ message: 'Google OAuth — not implemented yet' });
});

// GET /api/auth/github
router.get('/github', (req, res) => {
  // TODO: Passport GitHub OAuth
  res.status(501).json({ message: 'GitHub OAuth — not implemented yet' });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  // TODO: Token refresh
  res.status(501).json({ message: 'Token refresh — not implemented yet' });
});

module.exports = router;
