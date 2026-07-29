const { db } = require('../config/database');

/**
 * Submission Model - Knex Query Interface
 */

async function findById(id) {
  return db('submissions as s')
    .leftJoin('users as u', 's.user_id', 'u.id')
    .leftJoin('problems as p', 's.problem_id', 'p.id')
    .select(
      's.*',
      'u.username',
      'u.avatar_url',
      'p.title as problem_title'
    )
    .where('s.id', id)
    .first();
}

async function createSubmission(submissionData) {
  const [submission] = await db('submissions')
    .insert({
      user_id: submissionData.user_id,
      match_id: submissionData.match_id || null,
      problem_id: submissionData.problem_id,
      code: submissionData.code,
      language: submissionData.language,
      verdict: submissionData.verdict || 'PENDING',
      tests_passed: submissionData.tests_passed || 0,
      tests_total: submissionData.tests_total || 0,
      execution_time_ms: submissionData.execution_time_ms || null,
      memory_used_kb: submissionData.memory_used_kb || null,
      test_results: submissionData.test_results ? JSON.stringify(submissionData.test_results) : null,
    })
    .returning('*');

  return submission;
}

async function updateVerdict(id, { verdict, tests_passed, tests_total, execution_time_ms, memory_used_kb, test_results }) {
  const [submission] = await db('submissions')
    .where({ id })
    .update({
      verdict,
      tests_passed,
      tests_total,
      execution_time_ms,
      memory_used_kb,
      test_results: test_results ? JSON.stringify(test_results) : null,
      updated_at: db.fn.now(),
    })
    .returning('*');

  return submission;
}

async function getUserSubmissions(userId, { page = 1, limit = 20, problemId = null } = {}) {
  const offset = (page - 1) * limit;

  const query = db('submissions as s')
    .leftJoin('problems as p', 's.problem_id', 'p.id')
    .select('s.*', 'p.title as problem_title')
    .where('s.user_id', userId)
    .orderBy('s.created_at', 'desc');

  if (problemId) {
    query.where('s.problem_id', problemId);
  }

  const countQuery = db('submissions').where('user_id', userId);
  if (problemId) {
    countQuery.where('problem_id', problemId);
  }

  const [submissions, [{ total }]] = await Promise.all([
    query.limit(limit).offset(offset),
    countQuery.count('id as total'),
  ]);

  return {
    submissions,
    pagination: {
      total: parseInt(total, 10),
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(parseInt(total, 10) / limit),
    },
  };
}

module.exports = {
  findById,
  createSubmission,
  updateVerdict,
  getUserSubmissions,
};
