// Mock redis before requiring room.service
const mockStorage = new Map();

jest.mock('../src/config/redis', () => ({
  getRedisClient: jest.fn(() => ({
    set: jest.fn(async (key, val) => mockStorage.set(key, val)),
    setex: jest.fn(async (key, ttl, val) => mockStorage.set(key, val)),
    get: jest.fn(async (key) => mockStorage.get(key) || null),
    del: jest.fn(async (key) => mockStorage.delete(key)),
    ping: jest.fn(async () => 'PONG'),
    disconnect: jest.fn(),
  })),
  connectRedis: jest.fn(async () => {}),
}));

const { initRoomState, getRoomState, updateRoomState } = require('../src/services/room.service');

describe('Room & Socket Integration Unit Tests', () => {

  it('should initialize room state and retrieve it from Redis/memory', async () => {
    const matchData = {
      matchId: 'm-test-101',
      player1: { userId: 'u1', username: 'player1', rating: 1200 },
      player2: { userId: 'u2', username: 'player2', rating: 1250 },
      problem: { id: 'p1', title: 'Two Sum' },
      durationSeconds: 1800,
    };

    const room = await initRoomState('m-test-101', matchData);
    expect(room).toBeDefined();
    expect(room.roomId).toBe('m-test-101');
    expect(room.player1.username).toBe('player1');

    const fetched = await getRoomState('m-test-101');
    expect(fetched).toBeDefined();
    expect(fetched.matchId).toBe('m-test-101');

    const updated = await updateRoomState('m-test-101', { status: 'active' });
    expect(updated.status).toBe('active');
  });

});
