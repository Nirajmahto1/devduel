const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { User } = require('../models');
const matchmakingHandler = require('./matchmaking.handler');
const roomHandler = require('./room.handler');
const matchmakingService = require('../services/matchmaking.service');

const JWT_SECRET = process.env.JWT_SECRET || 'devduel_super_secret_jwt_key_2026';
let io = null;

function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ─── Socket Authentication Middleware ────────────────────
  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!authHeader) {
        return next(new Error('Authentication error: Token missing'));
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = {
        id: user.id,
        username: user.username,
        rating: user.rating,
      };

      next();
    } catch (err) {
      logger.error('Socket authentication failed:', err.message);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // ─── Connection Lifecycle ─────────────────────────
  io.on('connection', (socket) => {
    logger.info(`⚡ Socket connected: ${socket.id} (User: ${socket.user?.username})`);

    // Register event handlers
    matchmakingHandler(io, socket);
    roomHandler(io, socket);

    socket.on('disconnect', async (reason) => {
      logger.info(`💔 Socket disconnected: ${socket.id} (${reason})`);
      if (socket.user?.id) {
        try {
          await matchmakingService.removeFromQueue(socket.user.id);
        } catch (err) {
          logger.error(`Error cleaning queue for ${socket.user.id}:`, err.message);
        }
      }
    });

    socket.on('error', (err) => {
      logger.error(`Socket error [${socket.id}]:`, err.message);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initSocketServer, getIO };
