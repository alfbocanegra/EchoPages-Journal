export const createLogger = (name: string) => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
});

export const logger = createLogger('test'); 