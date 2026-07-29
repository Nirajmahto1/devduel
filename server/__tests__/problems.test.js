const problemController = require('../src/controllers/problem.controller');

describe('Problem Controller Unit Tests', () => {

  it('should format pagination correctly', async () => {
    const req = { query: { page: '1', limit: '10' } };
    let resData = null;
    const res = {
      status: (code) => ({
        json: (data) => {
          resData = data;
          return data;
        },
      }),
    };

    // Mock Problem.findAll
    const { Problem } = require('../src/models');
    jest.spyOn(Problem, 'findAll').mockResolvedValueOnce({
      problems: [{ id: 'p1', title: 'Two Sum' }],
      pagination: { total: 1, page: 1, limit: 10, pages: 1 },
    });

    await problemController.getProblems(req, res, (err) => expect(err).toBeUndefined());

    expect(resData.success).toBe(true);
    expect(resData.data.length).toBe(1);
    expect(resData.pagination.total).toBe(1);
  });

});
