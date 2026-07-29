const { User, Match } = require('../models');

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    const { password_hash, ...sanitized } = user;
    return res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { username, avatar_url } = req.body;

    if (username) {
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({
          success: false,
          error: { message: 'Username must be between 3 and 30 characters.' },
        });
      }

      const existing = await User.findByUsername(username);
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({
          success: false,
          error: { message: 'Username is already taken.' },
        });
      }
    }

    const updatedUser = await User.updateUser(req.user.id, { username, avatar_url });
    const { password_hash, ...sanitized } = updatedUser;

    return res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
}

async function getPublicProfile(req, res, next) {
  try {
    const { id } = req.params;
    let user = await User.findById(id);

    if (!user) {
      user = await User.findByUsername(id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User profile not found' },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        rating: user.rating,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getUserMatches(req, res, next) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    let user = await User.findById(id);
    if (!user) {
      user = await User.findByUsername(id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    const result = await Match.getUserMatchHistory(user.id, { page, limit });

    return res.status(200).json({
      success: true,
      data: result.matches,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getPublicProfile,
  getUserMatches,
};
