const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;

function getRedisClient() {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redis.on('error', (err) => {
      logger.error('Redis connection error:', err.message);
    });

    redis.on('connect', () => {
      logger.info('Redis client connected');
    });
  }
  return redis;
}

async function connectRedis() {
  const client = getRedisClient();
  await client.ping();
  return client;
}

module.exports = { getRedisClient, connectRedis };
