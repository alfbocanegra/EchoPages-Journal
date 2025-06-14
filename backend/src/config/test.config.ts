export const testConfig = {
  encryption: {
    key: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', // Test key, not for production
    algorithm: 'aes-256-gcm',
    nonceLength: 12,
    tagLength: 16,
  },
  postgres: {
    host: 'localhost',
    port: 5432,
    database: 'test_echopages',
    user: 'postgres',
    password: 'postgres',
  },
  sqlite: {
    database: ':memory:',
  },
}; 