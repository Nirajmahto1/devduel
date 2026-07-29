const { User } = require('../models');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

const CACHE_TTL_SECONDS = 300; // 5 minutes

async function getLeaderboard(req, res, next) {
  try {
    const period = req.query.period === 'weekly' ? 'weekly' : 'all';
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;

    const cacheKey = `leaderboard:${period}:${limit}:${offset}`;

    // Try reading from Redis cache
    try {
      const redis = getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          cached: true,
          data: JSON.parse(cached),
        });
      }
    } catch (cacheErr) {
      logger.warn('[Leaderboard] Redis cache read failed, falling back to DB:', cacheErr.message);
    }

    const result = await User.getLeaderboard({ period, limit, offset });

    // Cache in Redis
    try {
      const redis = getRedisClient();
      await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(result));
    } catch (cacheErr) {
      logger.warn('[Leaderboard] Redis cache write failed:', cacheErr.message);
    }

    return res.status(200).json({
      success: true,
      cached: false,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLeaderboard,
};
