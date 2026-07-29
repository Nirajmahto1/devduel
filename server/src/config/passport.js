const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { User } = require('../models');
const logger = require('../utils/logger');

// ─── JWT Strategy ──────────────────────────────────────────
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'devduel_super_secret_jwt_key_2026',
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      logger.error('JWT Strategy error:', error.message);
      return done(error, false);
    }
  })
);

// ─── Google OAuth Strategy ────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          let user = await User.findByOAuthId('google', profile.id);

          if (!user && email) {
            user = await User.findByEmail(email);
          }

          if (!user) {
            const baseUsername = profile.displayName ? profile.displayName.replace(/\s+/g, '').toLowerCase() : 'user';
            const username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

            user = await User.createUser({
              username,
              email: email || `${profile.id}@google.oauth`,
              oauth_provider: 'google',
              oauth_id: profile.id,
              avatar_url: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            });
          }

          return done(null, user);
        } catch (error) {
          logger.error('Google Strategy error:', error.message);
          return done(error, false);
        }
      }
    )
  );
}

// ─── GitHub OAuth Strategy ────────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          let user = await User.findByOAuthId('github', profile.id);

          if (!user && email) {
            user = await User.findByEmail(email);
          }

          if (!user) {
            const baseUsername = profile.username || (profile.displayName ? profile.displayName.replace(/\s+/g, '').toLowerCase() : 'user');
            let username = baseUsername;

            const existingUser = await User.findByUsername(username);
            if (existingUser) {
              username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
            }

            user = await User.createUser({
              username,
              email: email || `${profile.id}@github.oauth`,
              oauth_provider: 'github',
              oauth_id: profile.id,
              avatar_url: profile._json && profile._json.avatar_url ? profile._json.avatar_url : null,
            });
          }

          return done(null, user);
        } catch (error) {
          logger.error('GitHub Strategy error:', error.message);
          return done(error, false);
        }
      }
    )
  );
}

module.exports = passport;
