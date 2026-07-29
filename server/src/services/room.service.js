const { getRedisClient } = require('../config/redis');
const { Match, User } = require('../models');
const { calculateNewRatings } = require('../utils/elo');
const logger = require('../utils/logger');

const ROOM_KEY_PREFIX = 'room:state:';
const activeTimers = new Map(); // roomId -> intervalHandle
const disconnectTimers = new Map(); // socketId/userId -> timeoutHandle

/**
 * Initialize room state in Redis
 */
async function initRoomState(roomId, matchData) {
  const redis = getRedisClient();
  const roomState = {
    roomId,
    matchId: matchData.matchId || roomId,
    player1: matchData.player1,
    player2: matchData.player2,
    problem: matchData.problem,
    status: 'waiting', // waiting, active, finished
    connectedPlayers: [],
    durationSeconds: matchData.durationSeconds || 1800,
    secondsRemaining: matchData.durationSeconds || 1800,
    startedAt: null,
    endedAt: null,
    winnerId: null,
  };

  await redis.setex(`${ROOM_KEY_PREFIX}${roomId}`, 7200, JSON.stringify(roomState));
  return roomState;
}

/**
 * Get room state from Redis
 */
async function getRoomState(roomId) {
  const redis = getRedisClient();
  const raw = await redis.get(`${ROOM_KEY_PREFIX}${roomId}`);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Update room state in Redis
 */
async function updateRoomState(roomId, updateData) {
  const current = await getRoomState(roomId);
  if (!current) return null;

  const updated = { ...current, ...updateData };
  const redis = getRedisClient();
  await redis.setex(`${ROOM_KEY_PREFIX}${roomId}`, 7200, JSON.stringify(updated));
  return updated;
}

/**
 * Start room countdown timer tick
 */
function startRoomTimer(io, roomId) {
  if (activeTimers.has(roomId)) return;

  const timer = setInterval(async () => {
    try {
      const room = await getRoomState(roomId);
      if (!room || room.status !== 'active') {
        stopRoomTimer(roomId);
        return;
      }

      room.secondsRemaining -= 1;

      if (room.secondsRemaining <= 0) {
        stopRoomTimer(roomId);
        io.to(roomId).emit('room:countdown', { roomId, secondsRemaining: 0 });
        // Handle timeout draw or time-based win
        await handleMatchTimeout(io, roomId);
      } else {
        await updateRoomState(roomId, { secondsRemaining: room.secondsRemaining });
        io.to(roomId).emit('room:countdown', { roomId, secondsRemaining: room.secondsRemaining });
      }
    } catch (error) {
      logger.error(`[Room Service] Timer tick error for room ${roomId}:`, error.message);
    }
  }, 1000);

  activeTimers.set(roomId, timer);
}

/**
 * Stop room countdown timer
 */
function stopRoomTimer(roomId) {
  if (activeTimers.has(roomId)) {
    clearInterval(activeTimers.get(roomId));
    activeTimers.delete(roomId);
  }
}

/**
 * Conclude a match, calculate Elo updates, and record in DB
 */
async function concludeMatch({ roomId, winnerId, reason, io }) {
  stopRoomTimer(roomId);
  const room = await getRoomState(roomId);
  if (!room || room.status === 'finished') return null;

  const match = await Match.findById(room.matchId || roomId);
  if (!match) return null;

  const p1Id = match.player1_id;
  const p2Id = match.player2_id;

  const p1Rating = match.player1_rating_before || 1200;
  const p2Rating = match.player2_rating_before || 1200;

  let score1 = 0.5; // Default draw
  if (winnerId === p1Id) score1 = 1;
  else if (winnerId === p2Id) score1 = 0;

  const { newRatingA, newRatingB, changeA, changeB } = calculateNewRatings(p1Rating, p2Rating, score1);

  // Database transaction for atomic updates
  const { db } = require('../config/database');
  await db.transaction(async (trx) => {
    // Complete match record
    await Match.completeMatch(
      match.id,
      {
        winner_id: winnerId,
        status: winnerId ? 'completed' : 'draw',
        player1_rating_change: changeA,
        player2_rating_change: changeB,
      },
      trx
    );

    // Update Player 1
    if (p1Id) {
      await User.updateRatingAndStats(
        p1Id,
        {
          ratingChange: changeA,
          isWin: winnerId === p1Id,
          isLoss: winnerId === p2Id,
          isDraw: !winnerId,
        },
        trx
      );
    }

    // Update Player 2
    if (p2Id) {
      await User.updateRatingAndStats(
        p2Id,
        {
          ratingChange: changeB,
          isWin: winnerId === p2Id,
          isLoss: winnerId === p1Id,
          isDraw: !winnerId,
        },
        trx
      );
    }
  });

  const matchSummary = {
    winnerId,
    reason,
    eloChanges: {
      player1: { userId: p1Id, ratingBefore: p1Rating, ratingChange: changeA, ratingAfter: newRatingA },
      player2: { userId: p2Id, ratingBefore: p2Rating, ratingChange: changeB, ratingAfter: newRatingB },
    },
  };

  await updateRoomState(roomId, { status: 'finished', winnerId, endedAt: Date.now() });

  if (io) {
    io.to(roomId).emit('match:end', matchSummary);
  }

  return matchSummary;
}

/**
 * Handle room match timeout when countdown hits 0
 */
async function handleMatchTimeout(io, roomId) {
  logger.info(`[Room Service] Match timeout in room ${roomId}`);
  await concludeMatch({ roomId, winnerId: null, reason: 'timeout', io });
}

/**
 * Handle disconnect grace period (30 seconds before forfeit)
 */
function handleDisconnectGracePeriod(io, roomId, userId) {
  const key = `${roomId}:${userId}`;
  if (disconnectTimers.has(key)) clearTimeout(disconnectTimers.get(key));

  const timeout = setTimeout(async () => {
    logger.info(`[Room Service] Player ${userId} forfeit due to disconnect timeout in room ${roomId}`);
    const room = await getRoomState(roomId);
    if (room && room.status === 'active') {
      const winnerId = room.player1.userId === userId ? room.player2.userId : room.player1.userId;
      await concludeMatch({ roomId, winnerId, reason: 'disconnect', io });
    }
    disconnectTimers.delete(key);
  }, 30000); // 30s grace period

  disconnectTimers.set(key, timeout);
}

/**
 * Cancel disconnect grace period if player reconnects
 */
function cancelDisconnectGracePeriod(roomId, userId) {
  const key = `${roomId}:${userId}`;
  if (disconnectTimers.has(key)) {
    clearTimeout(disconnectTimers.get(key));
    disconnectTimers.delete(key);
    logger.info(`[Room Service] Cancelled disconnect grace timer for ${userId} in room ${roomId}`);
  }
}

module.exports = {
  initRoomState,
  getRoomState,
  updateRoomState,
  startRoomTimer,
  stopRoomTimer,
  concludeMatch,
  handleDisconnectGracePeriod,
  cancelDisconnectGracePeriod,
};
