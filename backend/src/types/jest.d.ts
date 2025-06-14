declare global {
  const jest: {
    fn: () => jest.Mock;
    beforeAll: (fn: () => void | Promise<void>) => void;
    beforeEach: (fn: () => void | Promise<void>) => void;
    afterAll: (fn: () => void | Promise<void>) => void;
    afterEach: (fn: () => void | Promise<void>) => void;
  };
}

export {}; 