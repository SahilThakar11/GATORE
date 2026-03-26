// ─── Mocks (must be declared BEFORE imports) ──────────────────────────────────

jest.mock('../../../src/config/jwt', () => ({
  jwtConfig: {
    secret: 'test-access-secret-32-chars-long!!',
    refreshSecret: 'test-refresh-secret-32-chars-long!',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
}));

jest.mock('../../../src/services/emailService', () => ({
  sendOTPEmail: jest.fn().mockResolvedValue(undefined),
  sendBusinessOTPEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../src/utils/google', () => ({
  getGoogleUserInfo: jest.fn(),
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import { Request, Response } from 'express';
import { prismaMock } from '../../__mocks__/prisma';
import { getGoogleUserInfo } from '../../../src/utils/google';
import {
  guestSignup,
  signupInit,
  verifyOTP,
  resendOTP,
  signupComplete,
  signin,
  googleAuth,
  saveProfile,
  getCurrentUser,
  logout,
  refreshAccessToken,
} from '../../../src/controllers/authController';

const mockGetGoogleUserInfo = getGoogleUserInfo as jest.MockedFunction<typeof getGoogleUserInfo>;

// ─── Test Helpers ─────────────────────────────────────────────────────────────

const buildReq = (body: object = {}, params: object = {}, user?: object): Request =>
  ({ body, params, user } as unknown as Request);

const buildRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const MOCK_USER = {
  id: 1,
  email: 'user@test.com',
  name: 'Test User',
  password: '$2b$10$somehash',
  role: 'user',
  isActive: true,
  emailVerified: true,
  isGuest: false,
  authProvider: 'email',
  googleId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

const MOCK_OTP_RECORD = {
  id: 1,
  code: '123456',
  userId: 1,
  type: 'email_verification',
  isUsed: false,
  expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min from now
  createdAt: new Date(),
} as any;

const MOCK_REFRESH_TOKEN = {
  id: 1,
  token: 'refresh-token-string',
  userId: 1,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
} as any;

// ─── guestSignup ──────────────────────────────────────────────────────────────
describe('guestSignup', () => {
  it('returns 201 with existing guest user if already registered', async () => {
    const guestUser = { ...MOCK_USER, isGuest: true };
    prismaMock.user.findUnique.mockResolvedValue(guestUser);

    const req = buildReq({ email: 'guest@test.com' });
    const res = buildRes();
    await guestSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('creates a new guest user and returns 201', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ ...MOCK_USER, isGuest: true });

    const req = buildReq({ email: 'newguest@test.com' });
    const res = buildRes();
    await guestSignup(req, res);

    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 500 on database error', async () => {
    prismaMock.user.findUnique.mockRejectedValue(new Error('DB error'));

    const req = buildReq({ email: 'guest@test.com' });
    const res = buildRes();
    await guestSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── signupInit ────────────────────────────────────────────────────────────────
describe('signupInit', () => {
  it('returns 400 when a fully registered user tries to sign up again', async () => {
    const verifiedUser = { ...MOCK_USER, emailVerified: true, password: 'has-password' };
    prismaMock.user.findUnique.mockResolvedValue(verifiedUser);

    const req = buildReq({ email: 'user@test.com' });
    const res = buildRes();
    await signupInit(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it('returns 200 with resume_password for verified user with no password set', async () => {
    const partialUser = { ...MOCK_USER, emailVerified: true, password: '' };
    prismaMock.user.findUnique.mockResolvedValue(partialUser);

    const req = buildReq({ email: 'user@test.com' });
    const res = buildRes();
    await signupInit(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'resume_password' }),
    );
  });

  it('resends OTP for existing unverified user', async () => {
    const unverifiedUser = { ...MOCK_USER, emailVerified: false };
    prismaMock.user.findUnique.mockResolvedValue(unverifiedUser);
    prismaMock.otpCode.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.otpCode.create.mockResolvedValue(MOCK_OTP_RECORD);

    const req = buildReq({ email: 'user@test.com' });
    const res = buildRes();
    await signupInit(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: expect.stringContaining('OTP') }),
    );
  });

  it('creates new user and sends OTP for brand-new email', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ ...MOCK_USER, emailVerified: false, password: '' });
    prismaMock.otpCode.create.mockResolvedValue(MOCK_OTP_RECORD);

    const req = buildReq({ email: 'new@test.com' });
    const res = buildRes();
    await signupInit(req, res);

    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

// ─── verifyOTP ────────────────────────────────────────────────────────────────
describe('verifyOTP', () => {
  it('returns 404 when user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = buildReq({ email: 'nobody@test.com', otp: '123456' });
    const res = buildRes();
    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when email is already verified', async () => {
    prismaMock.user.findUnique.mockResolvedValue(MOCK_USER); // emailVerified: true

    const req = buildReq({ email: 'user@test.com', otp: '123456' });
    const res = buildRes();
    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when OTP record is not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_USER, emailVerified: false });
    prismaMock.otpCode.findFirst.mockResolvedValue(null);

    const req = buildReq({ email: 'user@test.com', otp: '000000' });
    const res = buildRes();
    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid OTP code' }),
    );
  });

  it('returns 400 when OTP is expired', async () => {
    const expiredOtp = { ...MOCK_OTP_RECORD, expiresAt: new Date(Date.now() - 1000) };
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_USER, emailVerified: false });
    prismaMock.otpCode.findFirst.mockResolvedValue(expiredOtp);

    const req = buildReq({ email: 'user@test.com', otp: '123456' });
    const res = buildRes();
    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('expired') }),
    );
  });

  it('returns 200 with tokens on successful OTP verification', async () => {
    const unverifiedUser = { ...MOCK_USER, emailVerified: false };
    const verifiedUser = { ...MOCK_USER, emailVerified: true };
    prismaMock.user.findUnique.mockResolvedValue(unverifiedUser);
    prismaMock.otpCode.findFirst.mockResolvedValue(MOCK_OTP_RECORD);
    prismaMock.otpCode.update.mockResolvedValue({ ...MOCK_OTP_RECORD, isUsed: true });
    prismaMock.user.update.mockResolvedValue(verifiedUser);
    prismaMock.refreshToken.create.mockResolvedValue(MOCK_REFRESH_TOKEN);

    const req = buildReq({ email: 'user@test.com', otp: '123456' });
    const res = buildRes();
    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      }),
    );
  });
});

// ─── signupComplete ────────────────────────────────────────────────────────────
describe('signupComplete', () => {
  it('returns 404 when user is not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = buildReq({ email: 'x@test.com', password: 'Secure1!', name: 'X' });
    const res = buildRes();
    await signupComplete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 403 when email is not verified', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_USER, emailVerified: false });

    const req = buildReq({ email: 'user@test.com', password: 'Secure1!', name: 'Name' });
    const res = buildRes();
    await signupComplete(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 400 when password is already set', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_USER, password: 'existing-hash' });

    const req = buildReq({ email: 'user@test.com', password: 'Secure1!', name: 'Name' });
    const res = buildRes();
    await signupComplete(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 200 when password is set successfully', async () => {
    const noPasswordUser = { ...MOCK_USER, emailVerified: true, password: '' };
    prismaMock.user.findUnique.mockResolvedValue(noPasswordUser);
    prismaMock.user.update.mockResolvedValue(MOCK_USER);

    const req = buildReq({ email: 'user@test.com', password: 'Secure1!', name: 'Test' });
    const res = buildRes();
    await signupComplete(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});

// ─── signin ───────────────────────────────────────────────────────────────────
describe('signin', () => {
  it('returns 401 when user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = buildReq({ email: 'nobody@test.com', password: 'pass' });
    const res = buildRes();
    await signin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 403 when email is not verified', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_USER, emailVerified: false });

    const req = buildReq({ email: 'user@test.com', password: 'pass' });
    const res = buildRes();
    await signin(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 when account is deactivated', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_USER, isActive: false });

    const req = buildReq({ email: 'user@test.com', password: 'pass' });
    const res = buildRes();
    await signin(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 when business user tries to sign in through consumer portal', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_USER, role: 'business' });

    const req = buildReq({ email: 'biz@test.com', password: 'pass' });
    const res = buildRes();
    await signin(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 when Google-only user tries password sign-in', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...MOCK_USER,
      authProvider: 'google',
      password: '',
    });

    const req = buildReq({ email: 'g@test.com', password: 'pass' });
    const res = buildRes();
    await signin(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 401 when password is incorrect', async () => {
    prismaMock.user.findUnique.mockResolvedValue(MOCK_USER);

    const req = buildReq({ email: 'user@test.com', password: 'wrong-password' });
    const res = buildRes();
    await signin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 with tokens when credentials are valid', async () => {
    // Use a real bcrypt hash for 'Correct1!' so comparePassword passes
    const { hashPassword } = require('../../../src/utils/password');
    const hashedPassword = await hashPassword('Correct1!');
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_USER, password: hashedPassword });
    prismaMock.refreshToken.create.mockResolvedValue(MOCK_REFRESH_TOKEN);

    const req = buildReq({ email: 'user@test.com', password: 'Correct1!' });
    const res = buildRes();
    await signin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ accessToken: expect.any(String) }),
      }),
    );
  });
});

// ─── googleAuth ────────────────────────────────────────────────────────────────
describe('googleAuth', () => {
  it('returns 400 when no token is provided', async () => {
    const req = buildReq({ token: '' });
    const res = buildRes();
    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when Google email is not verified', async () => {
    mockGetGoogleUserInfo.mockResolvedValue({ email_verified: false, email: 'g@g.com' } as any);

    const req = buildReq({ token: 'google-token' });
    const res = buildRes();
    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates new user and returns 200 for first-time Google sign-in', async () => {
    mockGetGoogleUserInfo.mockResolvedValue({
      email_verified: true,
      email: 'new@google.com',
      name: 'New User',
      sub: 'google-id-123',
    } as any);
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ ...MOCK_USER, googleId: 'google-id-123' });
    prismaMock.refreshToken.create.mockResolvedValue(MOCK_REFRESH_TOKEN);

    const req = buildReq({ token: 'valid-google-token' });
    const res = buildRes();
    await googleAuth(req, res);

    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isNewUser: true }) }),
    );
  });

  it('links Google to existing email user when googleId is null', async () => {
    mockGetGoogleUserInfo.mockResolvedValue({
      email_verified: true,
      email: 'existing@test.com',
      name: 'Existing User',
      sub: 'google-sub',
    } as any);
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_USER, googleId: null });
    prismaMock.user.update.mockResolvedValue({ ...MOCK_USER, googleId: 'google-sub' });
    prismaMock.refreshToken.create.mockResolvedValue(MOCK_REFRESH_TOKEN);

    const req = buildReq({ token: 'valid-google-token' });
    const res = buildRes();
    await googleAuth(req, res);

    expect(prismaMock.user.update).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('signs in existing linked Google user without update', async () => {
    mockGetGoogleUserInfo.mockResolvedValue({
      email_verified: true,
      email: 'linked@test.com',
      name: 'Linked User',
      sub: 'existing-google-sub',
    } as any);
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_USER, googleId: 'existing-google-sub' });
    prismaMock.refreshToken.create.mockResolvedValue(MOCK_REFRESH_TOKEN);

    const req = buildReq({ token: 'valid-google-token' });
    const res = buildRes();
    await googleAuth(req, res);

    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isNewUser: false }) }),
    );
  });
});

// ─── getCurrentUser ────────────────────────────────────────────────────────────
describe('getCurrentUser', () => {
  it('returns 401 when req.user is absent', async () => {
    const req = buildReq({}, {}, undefined);
    const res = buildRes();
    await getCurrentUser(req as any, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when user is not in the database', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = buildReq({}, {}, { userId: 99, email: 'x@x.com', role: 'user' });
    const res = buildRes();
    await getCurrentUser(req as any, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 with user data on success', async () => {
    prismaMock.user.findUnique.mockResolvedValue(MOCK_USER);

    const req = buildReq({}, {}, { userId: 1, email: 'user@test.com', role: 'user' });
    const res = buildRes();
    await getCurrentUser(req as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ user: MOCK_USER }) }),
    );
  });
});

// ─── logout ────────────────────────────────────────────────────────────────────
describe('logout', () => {
  it('deletes the refresh token from DB when one is provided', async () => {
    prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

    const req = buildReq({ refreshToken: 'some-refresh-token' });
    const res = buildRes();
    await logout(req as any, res);

    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { token: 'some-refresh-token' } }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 200 even without a refresh token in the body', async () => {
    const req = buildReq({});
    const res = buildRes();
    await logout(req as any, res);

    expect(prismaMock.refreshToken.deleteMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─── refreshAccessToken ───────────────────────────────────────────────────────
describe('refreshAccessToken', () => {
  it('returns 400 when no refresh token is provided', async () => {
    const req = buildReq({});
    const res = buildRes();
    await refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 401 when the refresh token is not in the database', async () => {
    // The token must be a valid JWT first so verifyRefreshToken passes
    const { generateRefreshToken } = require('../../../src/utils/jwt');
    const token = generateRefreshToken({ userId: 1, email: 'u@u.com', role: 'user' });
    prismaMock.refreshToken.findUnique.mockResolvedValue(null);

    const req = buildReq({ refreshToken: token });
    const res = buildRes();
    await refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 with a new access token when the refresh token is valid', async () => {
    const { generateRefreshToken } = require('../../../src/utils/jwt');
    const token = generateRefreshToken({ userId: 1, email: 'u@u.com', role: 'user' });
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      ...MOCK_REFRESH_TOKEN,
      token,
      expiresAt: new Date(Date.now() + 60000),
    });

    const req = buildReq({ refreshToken: token });
    const res = buildRes();
    await refreshAccessToken(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ accessToken: expect.any(String) }),
      }),
    );
  });
});

// ─── resendOTP ────────────────────────────────────────────────────────────────
describe('resendOTP', () => {
  it('returns 200 (safe response) when user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = buildReq({ email: 'unknown@test.com' });
    const res = buildRes();
    await resendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 400 when email is already verified', async () => {
    prismaMock.user.findUnique.mockResolvedValue(MOCK_USER); // emailVerified: true

    const req = buildReq({ email: 'user@test.com' });
    const res = buildRes();
    await resendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('sends a new OTP and returns 200 for unverified user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_USER, emailVerified: false });
    prismaMock.otpCode.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.otpCode.create.mockResolvedValue(MOCK_OTP_RECORD);

    const req = buildReq({ email: 'user@test.com' });
    const res = buildRes();
    await resendOTP(req, res);

    expect(prismaMock.otpCode.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─── saveProfile ──────────────────────────────────────────────────────────────
describe('saveProfile', () => {
  it('returns 404 when user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = buildReq({ email: 'x@x.com', name: 'X' });
    const res = buildRes();
    await saveProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 403 when email is not verified', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_USER, emailVerified: false });

    const req = buildReq({ email: 'user@test.com', name: 'Test' });
    const res = buildRes();
    await saveProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 200 with updated user on success', async () => {
    prismaMock.user.findUnique.mockResolvedValue(MOCK_USER);
    prismaMock.user.update.mockResolvedValue({ ...MOCK_USER, name: 'New Name' });

    const req = buildReq({ email: 'user@test.com', name: 'New Name' });
    const res = buildRes();
    await saveProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ user: expect.any(Object) }) }),
    );
  });
});
