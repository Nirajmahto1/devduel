const { Submission, Problem, TestCase } = require('../models');
const judge0Service = require('../services/judge0.service');

async function submitCode(req, res, next) {
  try {
    const { problemId, matchId, language, code } = req.body;

    if (!problemId || !language || !code) {
      return res.status(400).json({
        success: false,
        error: { message: 'Problem ID, language, and code are required.' },
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem || !problem.is_active) {
      return res.status(404).json({
        success: false,
        error: { message: 'Problem not found or inactive' },
      });
    }

    const testCases = await TestCase.findByProblemId(problemId);
    if (testCases.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No test cases available for this problem' },
      });
    }

    // Judge code against test cases
    const judgeResult = await judge0Service.submitFullTests(
      language,
      code,
      testCases,
      problem.time_limit_ms,
      problem.memory_limit_kb
    );

    // Record submission in DB
    const submission = await Submission.createSubmission({
      user_id: req.user.id,
      match_id: matchId || null,
      problem_id: problemId,
      code,
      language,
      verdict: judgeResult.verdict,
      tests_passed: judgeResult.testsPassed,
      tests_total: judgeResult.testsTotal,
      execution_time_ms: judgeResult.executionTimeMs,
      memory_used_kb: judgeResult.memoryUsedKb,
      test_results: judgeResult.testResults,
    });

    return res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
}

async function getSubmissionById(req, res, next) {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: { message: 'Submission not found' },
      });
    }

    return res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
}

async function getUserSubmissions(req, res, next) {
  try {
    const userId = req.params.userId || req.user.id;
    const { problemId, page = 1, limit = 20 } = req.query;

    const result = await Submission.getUserSubmissions(userId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      problemId,
    });

    return res.status(200).json({
      success: true,
      data: result.submissions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitCode,
  getSubmissionById,
  getUserSubmissions,
};
