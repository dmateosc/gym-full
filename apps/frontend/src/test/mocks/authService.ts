export const AuthService = {
  signUp: jest.fn().mockResolvedValue({}),
  signIn: jest.fn().mockResolvedValue({}),
  signInWithGoogle: jest.fn().mockResolvedValue({}),
  signOut: jest.fn().mockResolvedValue(undefined),
  getSession: jest.fn().mockResolvedValue(null),
  syncProfile: jest.fn().mockResolvedValue(null),
  getMyProfile: jest.fn().mockResolvedValue(null),
};
