const router = require('express').Router();
const problemController = require('../controllers/problem.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

// GET /api/problems — Public: List problems with pagination & filters
router.get('/', problemController.getProblems);

// GET /api/problems/:id — Public: Problem detail
router.get('/:id', problemController.getProblemById);

// POST /api/problems — Admin: Create problem
router.post('/', authenticate, authorizeAdmin, problemController.createProblem);

// PUT /api/problems/:id — Admin: Update problem
router.put('/:id', authenticate, authorizeAdmin, problemController.updateProblem);

// DELETE /api/problems/:id — Admin: Delete problem
router.delete('/:id', authenticate, authorizeAdmin, problemController.deleteProblem);

module.exports = router;
