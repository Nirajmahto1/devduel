const { db } = require('../config/database');

/**
 * Problem Model - Knex Query Interface
 */

async function findById(id, includeTestCases = false) {
  const problem = await db('problems').where({ id }).first();
  if (!problem) return null;

  if (includeTestCases) {
    const testCases = await db('test_cases')
      .where({ problem_id: id })
      .orderBy('order', 'asc');
    problem.test_cases = testCases;
  }

  return problem;
}

async function findAll({ difficulty, tags, page = 1, limit = 20, is_active = true } = {}) {
  const query = db('problems');

  if (is_active !== null && is_active !== undefined) {
    query.where('is_active', is_active);
  }

  if (difficulty) {
    query.where('difficulty', difficulty.toLowerCase());
  }

  if (tags) {
    const tagList = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    if (tagList.length > 0) {
      query.whereRaw('tags && ?', [tagList]);
    }
  }

  const offset = (page - 1) * limit;
  const countQuery = query.clone().clearSelect().count('id as total');

  const [problems, [{ total }]] = await Promise.all([
    query.select('*').orderBy('created_at', 'desc').limit(limit).offset(offset),
    countQuery,
  ]);

  return {
    problems,
    pagination: {
      total: parseInt(total, 10),
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(parseInt(total, 10) / limit),
    },
  };
}

async function findRandomByDifficulty(difficulty = null) {
  const query = db('problems').where('is_active', true);
  if (difficulty) {
    query.where('difficulty', difficulty);
  }
  return query.orderByRaw('RANDOM()').first();
}

async function createProblem(problemData) {
  const [problem] = await db('problems')
    .insert({
      title: problemData.title,
      description: problemData.description,
      difficulty: problemData.difficulty,
      tags: problemData.tags || [],
      input_format: problemData.input_format || null,
      output_format: problemData.output_format || null,
      constraints: problemData.constraints || null,
      sample_input: problemData.sample_input || null,
      sample_output: problemData.sample_output || null,
      time_limit_ms: problemData.time_limit_ms || 2000,
      memory_limit_kb: problemData.memory_limit_kb || 256000,
      created_by: problemData.created_by || null,
      is_active: problemData.is_active !== undefined ? problemData.is_active : true,
    })
    .returning('*');

  return problem;
}

async function updateProblem(id, updateData) {
  updateData.updated_at = db.fn.now();
  const [problem] = await db('problems')
    .where({ id })
    .update(updateData)
    .returning('*');
  return problem;
}

async function deleteProblem(id) {
  return db('problems').where({ id }).del();
}

module.exports = {
  findById,
  findAll,
  findRandomByDifficulty,
  createProblem,
  updateProblem,
  deleteProblem,
};
