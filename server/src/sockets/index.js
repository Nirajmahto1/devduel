const { Server } = require('socket.io');
const logger = require('../utils/logger');
const matchmakingHandler = require('./matchmaking.handler');
const roomHandler = require('./room.handler');

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

  io.on('connection', (socket) => {
    logger.info(`⚡ Socket connected: ${socket.id}`);

    // Register event handlers
    matchmakingHandler(io, socket);
    roomHandler(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`💔 Socket disconnected: ${socket.id} (${reason})`);
      // TODO: Handle cleanup — remove from queue, notify opponent, etc.
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
