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

    // Mock Redis get/set if Redis container is offline
    const redisModule = require('../src/config/redis');
    const mockRedis = {
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(JSON.stringify({
        roomId: 'm-test-101',
        ...matchData,
        status: 'waiting',
        connectedPlayers: [],
      })),
    };
    jest.spyOn(redisModule, 'getRedisClient').mockReturnValue(mockRedis);

    const room = await initRoomState('m-test-101', matchData);
    expect(room).toBeDefined();
    expect(room.roomId).toBe('m-test-101');
    expect(room.player1.username).toBe('player1');

    const fetched = await getRoomState('m-test-101');
    expect(fetched.matchId).toBe('m-test-101');
  });

});
