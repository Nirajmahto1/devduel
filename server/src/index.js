require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const http = require('http');
const app = require('./app');
const { initSocketServer } = require('./sockets');
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to PostgreSQL
    await connectDatabase();
    logger.info('✅ PostgreSQL connected');

    // Connect to Redis
    await connectRedis();
    logger.info('✅ Redis connected');

    // Create HTTP server and attach Socket.io
    const server = http.createServer(app);
    initSocketServer(server);
    logger.info('✅ Socket.io initialized');

    server.listen(PORT, () => {
      logger.info(`🚀 DevDuel server running on port ${PORT}`);
      logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
