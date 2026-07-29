const { Problem, TestCase } = require('../models');

async function getProblems(req, res, next) {
  try {
    const { difficulty, tags, page = 1, limit = 20 } = req.query;

    const result = await Problem.findAll({
      difficulty,
      tags,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      is_active: true,
    });

    return res.status(200).json({
      success: true,
      data: result.problems,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

async function getProblemById(req, res, next) {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);

    if (!problem || !problem.is_active) {
      return res.status(404).json({
        success: false,
        error: { message: 'Problem not found' },
      });
    }

    // Include sample test cases for normal problem view
    const sampleCases = await TestCase.findByProblemId(id, true);

    return res.status(200).json({
      success: true,
      data: {
        ...problem,
        sample_test_cases: sampleCases,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function createProblem(req, res, next) {
  try {
    const { title, description, difficulty, tags, input_format, output_format, constraints, sample_input, sample_output, time_limit_ms, memory_limit_kb, test_cases } = req.body;

    if (!title || !description || !difficulty) {
      return res.status(400).json({
        success: false,
        error: { message: 'Title, description, and difficulty are required.' },
      });
    }

    const problem = await Problem.createProblem({
      title,
      description,
      difficulty,
      tags,
      input_format,
      output_format,
      constraints,
      sample_input,
      sample_output,
      time_limit_ms,
      memory_limit_kb,
      created_by: req.user ? req.user.id : null,
    });

    let createdCases = [];
    if (Array.isArray(test_cases) && test_cases.length > 0) {
      const formattedCases = test_cases.map((tc, idx) => ({
        problem_id: problem.id,
        input: tc.input,
        expected_output: tc.expected_output,
        is_sample: tc.is_sample || false,
        order: idx,
      }));
      createdCases = await TestCase.createTestCases(formattedCases);
    }

    return res.status(201).json({
      success: true,
      data: {
        ...problem,
        test_cases: createdCases,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateProblem(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await Problem.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Problem not found' },
      });
    }

    const { test_cases, ...updateFields } = req.body;
    const problem = await Problem.updateProblem(id, updateFields);

    if (Array.isArray(test_cases)) {
      await TestCase.deleteByProblemId(id);
      const formattedCases = test_cases.map((tc, idx) => ({
        problem_id: id,
        input: tc.input,
        expected_output: tc.expected_output,
        is_sample: tc.is_sample || false,
        order: idx,
      }));
      await TestCase.createTestCases(formattedCases);
    }

    const updatedWithCases = await Problem.findById(id, true);

    return res.status(200).json({
      success: true,
      data: updatedWithCases,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteProblem(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await Problem.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Problem not found' },
      });
    }

    await Problem.deleteProblem(id);

    return res.status(200).json({
      success: true,
      data: { message: 'Problem deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
};
