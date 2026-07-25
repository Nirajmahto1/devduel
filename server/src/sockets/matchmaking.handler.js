const logger = require('../utils/logger');

/**
 * Matchmaking Socket Events
 *
 * Events emitted by client:
 *   queue:join    { userId, rating }
 *   queue:leave   { userId }
 *
 * Events emitted by server:
 *   queue:waiting    { position }
 *   queue:matched    { roomId, opponent: { id, username, rating } }
 *   queue:error      { message }
 */
module.exports = function matchmakingHandler(io, socket) {

  socket.on('queue:join', async (data) => {
    try {
      logger.info(`[Matchmaking] ${socket.id} joining queue`, data);
      // TODO: Add to Redis sorted set by rating
      // TODO: Attempt to find match within ±150 Elo band
      // TODO: If match found → create room, emit queue:matched to both
      // TODO: If no match → emit queue:waiting with position
      socket.emit('queue:waiting', { position: 1 });
    } catch (error) {
      logger.error('[Matchmaking] queue:join error:', error.message);
      socket.emit('queue:error', { message: 'Failed to join queue' });
    }
  });

  socket.on('queue:leave', async (data) => {
    try {
      logger.info(`[Matchmaking] ${socket.id} leaving queue`, data);
      // TODO: Remove from Redis sorted set
    } catch (error) {
      logger.error('[Matchmaking] queue:leave error:', error.message);
    }
  });

};
