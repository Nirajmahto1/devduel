const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('./config/passport');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const problemRoutes = require('./routes/problem.routes');
const matchRoutes = require('./routes/match.routes');
const submissionRoutes = require('./routes/submission.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');

// Middleware imports
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// ─── Global Middleware ──────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// ─── Health Check ───────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'devduel-api',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ─────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// ─── Error Handling ─────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
