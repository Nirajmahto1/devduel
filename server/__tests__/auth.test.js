const { generateToken, sanitizeUser } = require('../src/controllers/auth.controller');
const jwt = require('jsonwebtoken');

describe('Auth Utilities & Tokens', () => {

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'niraj',
    email: 'niraj@example.com',
    password_hash: '$2a$10$xyz...',
    role: 'user',
    rating: 1200,
  };

  it('should sanitize user object by removing password_hash', () => {
    const sanitized = sanitizeUser(mockUser);
    expect(sanitized).not.toHaveProperty('password_hash');
    expect(sanitized).toHaveProperty('username', 'niraj');
    expect(sanitized).toHaveProperty('id', mockUser.id);
  });

  it('should generate valid JWT token containing user metadata', () => {
    const token = generateToken(mockUser);
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devduel_super_secret_jwt_key_2026');
    expect(decoded).toHaveProperty('id', mockUser.id);
    expect(decoded).toHaveProperty('username', mockUser.username);
    expect(decoded).toHaveProperty('email', mockUser.email);
  });

});
