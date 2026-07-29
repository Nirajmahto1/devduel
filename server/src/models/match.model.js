const { db } = require('../config/database');
const crypto = require('crypto');

/**
 * Match Model - Knex Query Interface
 */

function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 characters
}

async function findById(id) {
  const match = await db('matches as m')
    .leftJoin('users as p1', 'm.player1_id', 'p1.id')
    .leftJoin('users as p2', 'm.player2_id', 'p2.id')
    .leftJoin('users as w', 'm.winner_id', 'w.id')
    .leftJoin('problems as pr', 'm.problem_id', 'pr.id')
    .select(
      'm.*',
      'p1.username as player1_username',
      'p1.avatar_url as player1_avatar',
      'p1.rating as player1_rating_current',
      'p2.username as player2_username',
      'p2.avatar_url as player2_avatar',
      'p2.rating as player2_rating_current',
      'w.username as winner_username',
      'pr.title as problem_title',
      'pr.difficulty as problem_difficulty'
    )
    .where('m.id', id)
    .first();

  return match;
}

async function findByInviteCode(inviteCode) {
  if (!inviteCode) return null;
  return db('matches')
    .whereRaw('UPPER(invite_code) = UPPER(?)', [inviteCode])
    .first();
}

async function createMatch({ player1_id, player2_id = null, problem_id, match_type = 'ranked', duration_seconds = 1800, player1_rating_before = null, player2_rating_before = null }) {
  const inviteCode = match_type === 'private' ? generateInviteCode() : null;

  const [match] = await db('matches')
    .insert({
      player1_id,
      player2_id,
      problem_id,
      match_type,
      invite_code: inviteCode,
      status: player2_id ? 'active' : 'waiting',
      player1_rating_before,
      player2_rating_before,
      duration_seconds,
      started_at: player2_id ? db.fn.now() : null,
    })
    .returning('*');

  return match;
}

async function joinPrivateMatch(matchId, player2Id, player2Rating) {
  const [match] = await db('matches')
    .where({ id: matchId, status: 'waiting' })
    .update({
      player2_id: player2Id,
      player2_rating_before: player2Rating,
      status: 'active',
      started_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .returning('*');

  return match;
}

async function updateMatchStatus(id, status, extraData = {}) {
  const payload = {
    status,
    updated_at: db.fn.now(),
    ...extraData,
  };

  if (status === 'completed' || status === 'draw' || status === 'cancelled') {
    payload.ended_at = db.fn.now();
  }

  const [match] = await db('matches')
    .where({ id })
    .update(payload)
    .returning('*');

  return match;
}

async function completeMatch(id, { winner_id = null, status = 'completed', player1_rating_change = 0, player2_rating_change = 0 }) {
  const [match] = await db('matches')
    .where({ id })
    .update({
      winner_id,
      status,
      player1_rating_change,
      player2_rating_change,
      ended_at: db.fn.now(),
      updated_at: db.fn.now(),
    })
    .returning('*');

  return match;
}

async function getUserMatchHistory(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const query = db('matches as m')
    .leftJoin('users as p1', 'm.player1_id', 'p1.id')
    .leftJoin('users as p2', 'm.player2_id', 'p2.id')
    .leftJoin('problems as pr', 'm.problem_id', 'pr.id')
    .select(
      'm.*',
      'p1.username as player1_username',
      'p2.username as player2_username',
      'pr.title as problem_title',
      'pr.difficulty as problem_difficulty'
    )
    .where((builder) => {
      builder.where('m.player1_id', userId).orWhere('m.player2_id', userId);
    })
    .orderBy('m.created_at', 'desc');

  const countQuery = db('matches')
    .where((builder) => {
      builder.where('player1_id', userId).orWhere('player2_id', userId);
    })
    .count('id as total');

  const [matches, [{ total }]] = await Promise.all([
    query.limit(limit).offset(offset),
    countQuery,
  ]);

  return {
    matches,
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
  findByInviteCode,
  createMatch,
  joinPrivateMatch,
  updateMatchStatus,
  completeMatch,
  getUserMatchHistory,
  generateInviteCode,
};
