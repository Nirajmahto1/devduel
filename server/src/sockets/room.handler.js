const logger = require('../utils/logger');

/**
 * Duel Room Socket Events
 *
 * Events emitted by client:
 *   room:join         { roomId, userId }
 *   room:leave        { roomId }
 *   opponent:status   { roomId, status: 'typing' | 'running' | 'submitted' | 'idle' }
 *   code:run          { roomId, language, code }
 *   code:submit       { roomId, language, code }
 *
 * Events emitted by server:
 *   room:ready        { roomId, problem, players, startsAt }
 *   room:countdown    { roomId, secondsRemaining }
 *   opponent:update   { status, timestamp }
 *   code:verdict      { submissionId, verdict, testResults, timeMs }
 *   match:end         { winnerId, reason, eloChanges, summary }
 *   room:error        { message }
 */
module.exports = function roomHandler(io, socket) {

  socket.on('room:join', async (data) => {
    try {
      const { roomId, userId } = data;
      logger.info(`[Room] ${socket.id} joining room ${roomId}`);

      socket.join(roomId);
      // TODO: Validate room exists in Redis
      // TODO: Mark player as connected
      // TODO: If both players connected → emit room:ready with problem
    } catch (error) {
      logger.error('[Room] room:join error:', error.message);
      socket.emit('room:error', { message: 'Failed to join room' });
    }
  });

  socket.on('room:leave', async (data) => {
    try {
      const { roomId } = data;
      logger.info(`[Room] ${socket.id} leaving room ${roomId}`);
      socket.leave(roomId);
      // TODO: Notify opponent, handle forfeit logic
    } catch (error) {
      logger.error('[Room] room:leave error:', error.message);
    }
  });

  socket.on('opponent:status', (data) => {
    const { roomId, status } = data;
    // Broadcast to opponent only (everyone in room except sender)
    socket.to(roomId).emit('opponent:update', {
      status,
      timestamp: Date.now(),
    });
  });

  socket.on('code:run', async (data) => {
    try {
      const { roomId, language, code } = data;
      logger.info(`[Room] ${socket.id} running code in ${roomId}`);
      // TODO: Send to Judge0 with sample test cases only
      // TODO: Emit code:verdict with results
    } catch (error) {
      logger.error('[Room] code:run error:', error.message);
      socket.emit('room:error', { message: 'Code execution failed' });
    }
  });

  socket.on('code:submit', async (data) => {
    try {
      const { roomId, language, code } = data;
      logger.info(`[Room] ${socket.id} submitting code in ${roomId}`);
      // TODO: Send to Judge0 with ALL test cases
      // TODO: Store submission in DB
      // TODO: If all pass → winner logic → emit match:end
      // TODO: If not → emit code:verdict with failure
    } catch (error) {
      logger.error('[Room] code:submit error:', error.message);
      socket.emit('room:error', { message: 'Submission failed' });
    }
  });

};
