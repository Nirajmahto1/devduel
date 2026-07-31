const { getRedisClient } = require('../config/redis');
const { User, Problem, Match } = require('../models');
const logger = require('../utils/logger');

const QUEUE_ZSET_KEY_PREFIX = 'matchmaking:queue:ranked:';
const QUEUE_DATA_PREFIX = 'matchmaking:user:';

/**
 * Add a player to the matchmaking queue for a specific duration
 */
async function addToQueue(userId, socketId, durationMinutes = 30) {
  const redis = getRedisClient();
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const validDuration = Math.min(60, Math.max(5, parseInt(durationMinutes, 10) || 30));
  const zsetKey = `${QUEUE_ZSET_KEY_PREFIX}${validDuration}`;

  const payload = {
    userId: user.id,
    username: user.username,
    rating: user.rating || 1200,
    socketId,
    joinedAt: Date.now(),
    durationMinutes: validDuration,
    zsetKey,
  };

  // Add candidate to Redis
  await redis.set(`${QUEUE_DATA_PREFIX}${userId}`, JSON.stringify(payload));
  await redis.zadd(zsetKey, user.rating || 1200, userId);

  logger.info(`[Matchmaking Service] Added user ${user.username} (${user.rating}) to ${validDuration}m queue`);
  return payload;
}

/**
 * Remove a player from the queue
 */
async function removeFromQueue(userId) {
  const redis = getRedisClient();
  const raw = await redis.get(`${QUEUE_DATA_PREFIX}${userId}`);
  if (raw) {
    const candidate = JSON.parse(raw);
    const zsetKey = candidate.zsetKey || `${QUEUE_ZSET_KEY_PREFIX}30`;
    await redis.zrem(zsetKey, userId);
    await redis.del(`${QUEUE_DATA_PREFIX}${userId}`);
  }
  logger.info(`[Matchmaking Service] Removed user ${userId} from queue`);
}

/**
 * Attempt to match a user with another candidate in the queue matching duration
 */
async function findMatch(userId) {
  const redis = getRedisClient();
  const userDataRaw = await redis.get(`${QUEUE_DATA_PREFIX}${userId}`);

  if (!userDataRaw) return null;

  const candidate = JSON.parse(userDataRaw);
  const timeWaitedMs = Date.now() - candidate.joinedAt;
  const zsetKey = candidate.zsetKey || `${QUEUE_ZSET_KEY_PREFIX}30`;

  // Expanding rating band: starts at 150, increases by 50 every 5 seconds up to 400
  const expandedBand = Math.min(400, 150 + Math.floor(timeWaitedMs / 5000) * 50);
  const minRating = candidate.rating - expandedBand;
  const maxRating = candidate.rating + expandedBand;

  // Search ZSET for candidates within [minRating, maxRating] in same duration queue
  const potentialMatches = await redis.zrangebyscore(zsetKey, minRating, maxRating);

  for (const oppId of potentialMatches) {
    if (oppId === userId) continue;

    const oppDataRaw = await redis.get(`${QUEUE_DATA_PREFIX}${oppId}`);
    if (!oppDataRaw) {
      await redis.zrem(zsetKey, oppId);
      continue;
    }

    const opponent = JSON.parse(oppDataRaw);

    // Atomically remove both from queue to prevent double-matching
    const removed1 = await redis.zrem(zsetKey, userId);
    const removed2 = await redis.zrem(zsetKey, oppId);

    if (removed1 && removed2) {
      await redis.del(`${QUEUE_DATA_PREFIX}${userId}`);
      await redis.del(`${QUEUE_DATA_PREFIX}${oppId}`);

      // Pick a random problem
      const problem = await Problem.findRandomByDifficulty();
      if (!problem) {
        throw new Error('No problems available for match');
      }

      const durationSeconds = (candidate.durationMinutes || 30) * 60;

      // Create match in DB with selected duration
      const match = await Match.createMatch({
        player1_id: candidate.userId,
        player2_id: opponent.userId,
        problem_id: problem.id,
        match_type: 'ranked',
        player1_rating_before: candidate.rating,
        player2_rating_before: opponent.rating,
        duration_seconds: durationSeconds,
      });

      logger.info(`[Matchmaking Service] Match created! ${candidate.username} vs ${opponent.username} (${candidate.durationMinutes}m duration, Room ${match.id})`);

      return {
        matchId: match.id,
        roomId: match.id,
        durationSeconds,
        player1: candidate,
        player2: opponent,
        problem: {
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          description: problem.description,
          input_format: problem.input_format,
          output_format: problem.output_format,
          constraints: problem.constraints,
          sample_input: problem.sample_input,
          sample_output: problem.sample_output,
          time_limit_ms: problem.time_limit_ms,
          memory_limit_kb: problem.memory_limit_kb,
        },
      };
    }
  }

  return null;
}

module.exports = {
  addToQueue,
  removeFromQueue,
  findMatch,
};
