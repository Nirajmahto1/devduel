const { db } = require('../config/database');

/**
 * TestCase Model - Knex Query Interface
 */

async function findByProblemId(problemId, sampleOnly = false) {
  const query = db('test_cases')
    .where({ problem_id: problemId })
    .orderBy('order', 'asc');

  if (sampleOnly) {
    query.where('is_sample', true);
  }

  return query;
}

async function createTestCases(testCases) {
  if (!Array.isArray(testCases) || testCases.length === 0) return [];

  const rowsToInsert = testCases.map((tc, index) => ({
    problem_id: tc.problem_id,
    input: tc.input,
    expected_output: tc.expected_output,
    is_sample: tc.is_sample !== undefined ? tc.is_sample : false,
    order: tc.order !== undefined ? tc.order : index,
  }));

  return db('test_cases').insert(rowsToInsert).returning('*');
}

async function deleteByProblemId(problemId) {
  return db('test_cases').where({ problem_id: problemId }).del();
}

module.exports = {
  findByProblemId,
  createTestCases,
  deleteByProblemId,
};
