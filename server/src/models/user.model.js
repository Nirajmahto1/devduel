const { db } = require('../config/database');

/**
 * User Model - Knex Query Interface
 */

async function findById(id) {
  return db('users').where({ id }).first();
}

async function findByEmail(email) {
  if (!email) return null;
  return db('users').whereRaw('LOWER(email) = LOWER(?)', [email]).first();
}

async function findByUsername(username) {
  if (!username) return null;
  return db('users').whereRaw('LOWER(username) = LOWER(?)', [username]).first();
}

async function findByOAuthId(provider, oauthId) {
  if (!provider || !oauthId) return null;
  return db('users').where({ oauth_provider: provider, oauth_id: oauthId }).first();
}

async function createUser(userData) {
  const [user] = await db('users')
    .insert({
      username: userData.username,
      email: userData.email.toLowerCase(),
      password_hash: userData.password_hash || null,
      avatar_url: userData.avatar_url || null,
      oauth_provider: userData.oauth_provider || 'local',
      oauth_id: userData.oauth_id || null,
      role: userData.role || 'user',
      rating: userData.rating || 1200,
      wins: 0,
      losses: 0,
      draws: 0,
    })
    .returning('*');
  return user;
}

async function updateUser(id, updateData) {
  const allowedFields = ['username', 'email', 'avatar_url', 'role', 'password_hash'];
  const sanitizedData = {};

  Object.keys(updateData).forEach((key) => {
    if (allowedFields.includes(key) && updateData[key] !== undefined) {
      sanitizedData[key] = key === 'email' ? updateData[key].toLowerCase() : updateData[key];
    }
  });

  if (Object.keys(sanitizedData).length === 0) {
    return findById(id);
  }

  sanitizedData.updated_at = db.fn.now();

  const [user] = await db('users')
    .where({ id })
    .update(sanitizedData)
    .returning('*');

  return user;
}

async function updateRatingAndStats(id, { ratingChange, isWin, isLoss, isDraw }, trx = null) {
  const query = trx ? db('users').transacting(trx) : db('users');
  const user = await query.where({ id }).first();
  if (!user) throw new Error(`User with ID ${id} not found`);

  const newRating = Math.max(100, (user.rating || 1200) + ratingChange);
  const newWins = (user.wins || 0) + (isWin ? 1 : 0);
  const newLosses = (user.losses || 0) + (isLoss ? 1 : 0);
  const newDraws = (user.draws || 0) + (isDraw ? 1 : 0);

  const [updatedUser] = await query
    .where({ id })
    .update({
      rating: newRating,
      wins: newWins,
      losses: newLosses,
      draws: newDraws,
      updated_at: db.fn.now(),
    })
    .returning('*');

  return updatedUser;
}

async function getLeaderboard({ period = 'all', limit = 50, offset = 0 } = {}) {
  const query = db('users')
    .select(
      'id',
      'username',
      'avatar_url',
      'rating',
      'wins',
      'losses',
      'draws',
      'created_at'
    )
    .orderBy('rating', 'desc')
    .limit(limit)
    .offset(offset);

  if (period === 'weekly') {
    // Return users active or rating updated in past 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query.where('updated_at', '>=', sevenDaysAgo);
  }

  const users = await query;
  const [{ count }] = await db('users').count('id as count');

  return {
    users,
    total: parseInt(count, 10),
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  };
}

module.exports = {
  findById,
  findByEmail,
  findByUsername,
  findByOAuthId,
  createUser,
  updateUser,
  updateRatingAndStats,
  getLeaderboard,
};
