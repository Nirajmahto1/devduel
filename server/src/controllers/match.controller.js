const { Match, Problem, User } = require('../models');

async function getMatchDetails(req, res, next) {
  try {
    const { id } = req.params;
    const match = await Match.findById(id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: { message: 'Match not found' },
      });
    }

    return res.status(200).json({
      success: true,
      data: match,
    });
  } catch (error) {
    next(error);
  }
}

async function createPrivateRoom(req, res, next) {
  try {
    const { difficulty } = req.body;
    const user = await User.findById(req.user.id);

    const problem = await Problem.findRandomByDifficulty(difficulty || null);
    if (!problem) {
      return res.status(500).json({
        success: false,
        error: { message: 'No suitable problems available to create room' },
      });
    }

    const match = await Match.createMatch({
      player1_id: user.id,
      problem_id: problem.id,
      match_type: 'private',
      player1_rating_before: user.rating,
      duration_seconds: 1800,
    });

    return res.status(201).json({
      success: true,
      data: {
        matchId: match.id,
        inviteCode: match.invite_code,
        problem: {
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function joinPrivateRoom(req, res, next) {
  try {
    const { inviteCode, id } = req.body;
    const searchCode = inviteCode || req.params.id || id;

    if (!searchCode) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invite code or match ID is required' },
      });
    }

    let match = await Match.findByInviteCode(searchCode);
    if (!match) {
      match = await Match.findById(searchCode);
    }

    if (!match) {
      return res.status(404).json({
        success: false,
        error: { message: 'Private match room not found' },
      });
    }

    if (match.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        error: { message: 'This room is no longer accepting players' },
      });
    }

    if (match.player1_id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: { message: 'You are already in this room as Player 1' },
      });
    }

    const user = await User.findById(req.user.id);
    const updatedMatch = await Match.joinPrivateMatch(match.id, user.id, user.rating);

    return res.status(200).json({
      success: true,
      data: updatedMatch,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMatchDetails,
  createPrivateRoom,
  joinPrivateRoom,
};
