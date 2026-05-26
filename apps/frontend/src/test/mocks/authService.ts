export const TokenStorage = {
  get: jest.fn().mockReturnValue(null),
  set: jest.fn(),
  clear: jest.fn(),
};

export const AuthService = {
  signUp: jest.fn().mockResolvedValue({ token: 'mock-token', user: null }),
  signIn: jest.fn().mockResolvedValue({ token: 'mock-token', user: null }),
  signOut: jest.fn(),
  getMyProfile: jest.fn().mockResolvedValue(null),
  getToken: jest.fn().mockReturnValue(null),
};
