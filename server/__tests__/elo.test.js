const { expectedScore, calculateNewRatings } = require('../src/utils/elo');

describe('Elo Rating Calculator', () => {
  test('expected score for equal ratings should be 0.5', () => {
    expect(expectedScore(1200, 1200)).toBeCloseTo(0.5);
  });

  test('higher rated player should have higher expected score', () => {
    const higher = expectedScore(1400, 1200);
    const lower = expectedScore(1200, 1400);
    expect(higher).toBeGreaterThan(0.5);
    expect(lower).toBeLessThan(0.5);
    expect(higher + lower).toBeCloseTo(1.0);
  });

  test('winner gains rating, loser loses rating', () => {
    const result = calculateNewRatings(1200, 1200, 1); // Player A wins
    expect(result.newRatingA).toBeGreaterThan(1200);
    expect(result.newRatingB).toBeLessThan(1200);
    expect(result.changeA).toBe(-result.changeB); // Zero-sum
  });

  test('upset win gives more rating change', () => {
    const upset = calculateNewRatings(1000, 1400, 1);    // Underdog wins
    const expected = calculateNewRatings(1400, 1000, 1);  // Favorite wins
    expect(Math.abs(upset.changeA)).toBeGreaterThan(Math.abs(expected.changeA));
  });

  test('draw returns small adjustments toward convergence', () => {
    const result = calculateNewRatings(1400, 1200, 0.5);
    expect(result.changeA).toBeLessThan(0);  // Higher-rated loses a bit
    expect(result.changeB).toBeGreaterThan(0); // Lower-rated gains a bit
  });
});
