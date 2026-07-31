const logger = require('../utils/logger');
const roomService = require('../services/room.service');
const judge0Service = require('../services/judge0.service');
const { Match, Problem, TestCase, Submission, User } = require('../models');

module.exports = function roomHandler(io, socket) {

  socket.on('room:join', async (data = {}) => {
    try {
      const { roomId } = data;
      const userId = socket.user ? socket.user.id : data.userId;

      if (!roomId || !userId) {
        return socket.emit('room:error', { message: 'roomId and userId are required' });
      }

      logger.info(`[Room] ${socket.user?.username || userId} joining room ${roomId}`);
      socket.join(roomId);
      roomService.cancelDisconnectGracePeriod(roomId, userId);

      let room = await roomService.getRoomState(roomId);
      if (!room) {
        // Fallback: If room state is not in Redis, load match from DB
        const match = await Match.findById(roomId);
        if (match) {
          const problem = await Problem.findById(match.problem_id);
          const p1 = await User.findById(match.player1_id);
          const p2 = match.player2_id ? await User.findById(match.player2_id) : null;

          room = await roomService.initRoomState(roomId, {
            matchId: match.id,
            player1: { userId: p1?.id, username: p1?.username, rating: p1?.rating || 1200 },
            player2: p2 ? { userId: p2.id, username: p2.username, rating: p2.rating || 1200 } : null,
            problem,
            durationSeconds: match.duration_seconds || 1800,
          });
        }
      }

      if (!room) {
        return socket.emit('room:error', { message: 'Room not found or expired' });
      }

      // Add user to connected list if not present
      if (!room.connectedPlayers.includes(userId)) {
        room.connectedPlayers.push(userId);
        room = await roomService.updateRoomState(roomId, { connectedPlayers: room.connectedPlayers });
      }

      // If both players are in room, start duel with match duration!
      if (room.connectedPlayers.length >= 2 && room.status !== 'active' && room.status !== 'finished') {
        const matchDuration = room.durationSeconds || 1800;
        room = await roomService.updateRoomState(roomId, {
          status: 'active',
          startedAt: Date.now(),
          durationSeconds: matchDuration,
          secondsRemaining: matchDuration,
        });

        // Start server timer loop
        roomService.startRoomTimer(io, roomId);

        io.to(roomId).emit('room:ready', {
          roomId,
          problem: room.problem,
          players: {
            player1: room.player1,
            player2: room.player2,
          },
          durationSeconds: matchDuration,
          startsAt: room.startedAt,
        });
      } else if (room.status === 'active') {
        // Send current room state on reconnect / page refresh
        socket.emit('room:ready', {
          roomId,
          problem: room.problem,
          players: {
            player1: room.player1,
            player2: room.player2,
          },
          durationSeconds: room.durationSeconds,
          secondsRemaining: room.secondsRemaining,
          startsAt: room.startedAt,
        });
      }
    } catch (error) {
      logger.error('[Room] room:join error:', error.message);
      socket.emit('room:error', { message: error.message || 'Failed to join room' });
    }
  });

  socket.on('room:leave', async (data = {}) => {
    try {
      const { roomId } = data;
      const userId = socket.user ? socket.user.id : data.userId;

      if (roomId && userId) {
        logger.info(`[Room] ${socket.user?.username || userId} forfeit/leaving room ${roomId}`);
        socket.leave(roomId);

        const room = await roomService.getRoomState(roomId);
        if (room && room.status === 'active') {
          const winnerId = room.player1.userId === userId ? room.player2.userId : room.player1.userId;
          await roomService.concludeMatch({ roomId, winnerId, reason: 'forfeit', io });
        }
      }
    } catch (error) {
      logger.error('[Room] room:leave error:', error.message);
    }
  });

  socket.on('opponent:status', (data = {}) => {
    const { roomId, status } = data;
    if (roomId && status) {
      socket.to(roomId).emit('opponent:update', {
        userId: socket.user?.id,
        status,
        timestamp: Date.now(),
      });
    }
  });

  socket.on('code:run', async (data = {}) => {
    try {
      const { roomId, language, code } = data;

      if (!roomId || !language || !code) {
        return socket.emit('room:error', { message: 'roomId, language, and code are required' });
      }

      const room = await roomService.getRoomState(roomId);
      if (!room || !room.problem) {
        return socket.emit('room:error', { message: 'Active room problem not found' });
      }

      socket.to(roomId).emit('opponent:update', {
        userId: socket.user?.id,
        status: 'running',
        timestamp: Date.now(),
      });

      const sampleTestCases = await TestCase.findByProblemId(room.problem.id, true);
      const judgeResult = await judge0Service.runSampleTests(
        language,
        code,
        sampleTestCases,
        room.problem.time_limit_ms,
        room.problem.memory_limit_kb
      );

      socket.emit('code:verdict', {
        submissionId: null,
        isSampleRun: true,
        verdict: judgeResult.verdict,
        testsPassed: judgeResult.testsPassed,
        testsTotal: judgeResult.testsTotal,
        testResults: judgeResult.testResults,
      });

      socket.to(roomId).emit('opponent:update', {
        userId: socket.user?.id,
        status: 'idle',
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('[Room] code:run error:', error.message);
      socket.emit('room:error', { message: 'Sample code execution failed' });
    }
  });

  socket.on('code:submit', async (data = {}) => {
    try {
      const { roomId, language, code } = data;
      const userId = socket.user ? socket.user.id : data.userId;

      if (!roomId || !language || !code || !userId) {
        return socket.emit('room:error', { message: 'Missing submission parameters' });
      }

      const room = await roomService.getRoomState(roomId);
      if (!room || room.status !== 'active') {
        return socket.emit('room:error', { message: 'Match is not active' });
      }

      socket.to(roomId).emit('opponent:update', {
        userId,
        status: 'submitted',
        timestamp: Date.now(),
      });

      const allTestCases = await TestCase.findByProblemId(room.problem.id, false);
      const judgeResult = await judge0Service.submitFullTests(
        language,
        code,
        allTestCases,
        room.problem.time_limit_ms,
        room.problem.memory_limit_kb
      );

      // Save submission to database
      const dbSubmission = await Submission.createSubmission({
        user_id: userId,
        match_id: room.matchId || roomId,
        problem_id: room.problem.id,
        code,
        language,
        verdict: judgeResult.verdict,
        tests_passed: judgeResult.testsPassed,
        tests_total: judgeResult.testsTotal,
        execution_time_ms: judgeResult.executionTimeMs,
        memory_used_kb: judgeResult.memoryUsedKb,
        test_results: judgeResult.testResults,
      });

      socket.emit('code:verdict', {
        submissionId: dbSubmission.id,
        isSampleRun: false,
        verdict: judgeResult.verdict,
        testsPassed: judgeResult.testsPassed,
        testsTotal: judgeResult.testsTotal,
        executionTimeMs: judgeResult.executionTimeMs,
        memoryUsedKb: judgeResult.memoryUsedKb,
        testResults: judgeResult.testResults,
      });

      // If user solved the problem (AC) -> Match Winner!
      if (judgeResult.verdict === 'AC') {
        logger.info(`[Room] Match won by ${socket.user?.username || userId} in room ${roomId}`);
        await roomService.concludeMatch({
          roomId,
          winnerId: userId,
          reason: 'solved',
          io,
        });
      }
    } catch (error) {
      logger.error('[Room] code:submit error:', error.message);
      socket.emit('room:error', { message: 'Submission execution failed' });
    }
  });

};
