/**
 * Elo Rating Calculator
 *
 * Standard Elo implementation for DevDuel matchmaking and rating updates.
 * K-factor is configurable via env (default: 32).
 */

const K_FACTOR = parseInt(process.env.ELO_K_FACTOR, 10) || 32;

/**
 * Calculate expected score (probability of winning)
 * @param {number} ratingA - Player A's current rating
 * @param {number} ratingB - Player B's current rating
 * @returns {number} Expected score for Player A (0 to 1)
 */
function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ratings after a match
 * @param {number} ratingA - Player A's current rating
 * @param {number} ratingB - Player B's current rating
 * @param {number} scoreA - Actual score for A (1 = win, 0 = loss, 0.5 = draw)
 * @returns {{ newRatingA: number, newRatingB: number, changeA: number, changeB: number }}
 */
function calculateNewRatings(ratingA, ratingB, scoreA) {
  const scoreB = 1 - scoreA;
  const expectedA = expectedScore(ratingA, ratingB);
  const expectedB = expectedScore(ratingB, ratingA);

  const changeA = Math.round(K_FACTOR * (scoreA - expectedA));
  const changeB = Math.round(K_FACTOR * (scoreB - expectedB));

  return {
    newRatingA: ratingA + changeA,
    newRatingB: ratingB + changeB,
    changeA,
    changeB,
  };
}

module.exports = { expectedScore, calculateNewRatings };
