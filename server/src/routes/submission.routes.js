const router = require('express').Router();
const submissionController = require('../controllers/submission.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { submissionRateLimiter } = require('../middleware/rateLimiter.middleware');

// POST /api/submissions — Protected: Submit code for judging
router.post('/', authenticate, submissionRateLimiter, submissionController.submitCode);

// GET /api/submissions — Protected: List user's submissions
router.get('/', authenticate, submissionController.getUserSubmissions);

// GET /api/submissions/:id — Protected: Submission detail
router.get('/:id', authenticate, submissionController.getSubmissionById);

module.exports = router;
