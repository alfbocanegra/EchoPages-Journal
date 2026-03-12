// Mock for node-fetch
const mockFetch = jest.fn();

// Default mock implementation
mockFetch.mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({
    sub: 'mock-user-id',
    email: 'mock@example.com',
    name: 'Mock User',
  }),
});

module.exports = mockFetch; 