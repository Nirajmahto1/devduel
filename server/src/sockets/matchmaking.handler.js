const logger = require('../utils/logger');
const matchmakingService = require('../services/matchmaking.service');
const roomService = require('../services/room.service');

module.exports = function matchmakingHandler(io, socket) {

  socket.on('queue:join', async (data = {}) => {
    try {
      const userId = socket.user ? socket.user.id : data.userId;
      const durationMinutes = data.durationMinutes || 30;

      if (!userId) {
        return socket.emit('queue:error', { message: 'User ID is required' });
      }

      logger.info(`[Matchmaking] ${socket.user?.username || userId} joining queue (${durationMinutes} mins)`);
      await matchmakingService.addToQueue(userId, socket.id, durationMinutes);
      socket.emit('queue:waiting', {
        position: 1,
        durationMinutes,
        message: `Searching for an opponent (${durationMinutes}m duel)...`,
      });

      // Scan for match
      const match = await matchmakingService.findMatch(userId);
      if (match) {
        // Initialize room state with matched duration
        await roomService.initRoomState(match.roomId, match);

        // Notify Player 1
        io.to(match.player1.socketId).emit('queue:matched', {
          roomId: match.roomId,
          durationSeconds: match.durationSeconds,
          opponent: {
            id: match.player2.userId,
            username: match.player2.username,
            rating: match.player2.rating,
          },
        });

        // Notify Player 2
        io.to(match.player2.socketId).emit('queue:matched', {
          roomId: match.roomId,
          durationSeconds: match.durationSeconds,
          opponent: {
            id: match.player1.userId,
            username: match.player1.username,
            rating: match.player1.rating,
          },
        });
      }
    } catch (error) {
      logger.error('[Matchmaking] queue:join error:', error.message);
      socket.emit('queue:error', { message: error.message || 'Failed to join queue' });
    }
  });

  socket.on('queue:leave', async (data = {}) => {
    try {
      const userId = socket.user ? socket.user.id : data.userId;
      if (userId) {
        logger.info(`[Matchmaking] ${socket.user?.username || userId} leaving queue`);
        await matchmakingService.removeFromQueue(userId);
        socket.emit('queue:left', { success: true });
      }
    } catch (error) {
      logger.error('[Matchmaking] queue:leave error:', error.message);
    }
  });

};
