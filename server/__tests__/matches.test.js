const matchController = require('../src/controllers/match.controller');

describe('Match Controller Unit Tests', () => {

  it('should generate an 8-character uppercase invite code for private room', async () => {
    const req = { user: { id: 'u123' }, body: {} };
    let resData = null;
    const res = {
      status: (code) => ({
        json: (data) => {
          resData = data;
          return data;
        },
      }),
    };

    const { User, Problem, Match } = require('../src/models');
    jest.spyOn(User, 'findById').mockResolvedValueOnce({ id: 'u123', rating: 1200 });
    jest.spyOn(Problem, 'findRandomByDifficulty').mockResolvedValueOnce({ id: 'p123', title: 'Two Sum', difficulty: 'easy' });
    jest.spyOn(Match, 'createMatch').mockResolvedValueOnce({ id: 'm123', invite_code: 'A1B2C3D4' });

    await matchController.createPrivateRoom(req, res, (err) => expect(err).toBeUndefined());

    expect(resData.success).toBe(true);
    expect(resData.data.inviteCode).toBe('A1B2C3D4');
  });

});
