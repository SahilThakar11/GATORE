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

import { Request, Response } from 'express';
import { prismaMock } from '../../__mocks__/prisma';
import {
  submitAccessRequest,
  sendOTP,
  verifyOTP,
  resendOTP,
} from '../../../src/controllers/businessController';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const MOCK_ACCESS_REQUEST = {
  id: 1,
  cafeName: 'Test Cafe',
  ownerName: 'John Owner',
  email: 'owner@cafe.com',
  phone: '416-555-0000',
  city: 'Toronto',
  message: null,
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

const MOCK_APPROVED_REQUEST = { ...MOCK_ACCESS_REQUEST, status: 'approved' } as any;

const MOCK_BUSINESS_USER = {
  id: 5,
  email: 'owner@cafe.com',
  name: 'John Owner',
  role: 'business',
  isActive: true,
  emailVerified: true,
  password: '',
  isGuest: false,
  authProvider: 'email',
  googleId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

const MOCK_OTP_RECORD = {
  id: 1,
  code: '654321',
  userId: 5,
  type: 'business_login',
  isUsed: false,
  expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  createdAt: new Date(),
} as any;

const MOCK_REFRESH_TOKEN = {
  id: 1,
  token: 'rt',
  userId: 5,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
} as any;

// ─── submitAccessRequest ──────────────────────────────────────────────────────
describe('submitAccessRequest', () => {
  const VALID_BODY = {
    cafeName: 'Test Cafe',
    ownerName: 'John Owner',
    email: 'owner@cafe.com',
    phone: '416-555-0000',
    city: 'Toronto',
  };

  it('returns 409 when a pending request already exists for this email', async () => {
    prismaMock.businessAccessRequest.findFirst.mockResolvedValue(MOCK_ACCESS_REQUEST);

    const req = { body: VALID_BODY } as unknown as Request;
    const res = buildRes();
    await submitAccessRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it('creates a new access request and returns 201', async () => {
    prismaMock.businessAccessRequest.findFirst.mockResolvedValue(null);
    prismaMock.businessAccessRequest.create.mockResolvedValue(MOCK_ACCESS_REQUEST);

    const req = { body: VALID_BODY } as unknown as Request;
    const res = buildRes();
    await submitAccessRequest(req, res);

    expect(prismaMock.businessAccessRequest.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  it('returns 500 on database error', async () => {
    prismaMock.businessAccessRequest.findFirst.mockRejectedValue(new Error('DB error'));

    const req = { body: VALID_BODY } as unknown as Request;
    const res = buildRes();
    await submitAccessRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── sendOTP ──────────────────────────────────────────────────────────────────
describe('sendOTP', () => {
  it('returns 403 when request is still pending (not yet approved)', async () => {
    // first findFirst (approved check) → null, second (pending check) → pending request
    prismaMock.businessAccessRequest.findFirst
      .mockResolvedValueOnce(null)          // no approved request
      .mockResolvedValueOnce(MOCK_ACCESS_REQUEST); // found pending request

    const req = { body: { email: 'owner@cafe.com' } } as unknown as Request;
    const res = buildRes();
    await sendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('under review') }),
    );
  });

  it('returns 404 when no request exists for this email', async () => {
    prismaMock.businessAccessRequest.findFirst
      .mockResolvedValueOnce(null) // no approved
      .mockResolvedValueOnce(null); // no pending

    const req = { body: { email: 'unknown@cafe.com' } } as unknown as Request;
    const res = buildRes();
    await sendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 403 when business account has not been set up yet (no user record)', async () => {
    prismaMock.businessAccessRequest.findFirst.mockResolvedValue(MOCK_APPROVED_REQUEST);
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = { body: { email: 'owner@cafe.com' } } as unknown as Request;
    const res = buildRes();
    await sendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 when the user is not a business role', async () => {
    prismaMock.businessAccessRequest.findFirst.mockResolvedValue(MOCK_APPROVED_REQUEST);
    prismaMock.user.findUnique.mockResolvedValue({ ...MOCK_BUSINESS_USER, role: 'user' });

    const req = { body: { email: 'owner@cafe.com' } } as unknown as Request;
    const res = buildRes();
    await sendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('sends OTP and returns 200 for approved business user', async () => {
    prismaMock.businessAccessRequest.findFirst.mockResolvedValue(MOCK_APPROVED_REQUEST);
    prismaMock.user.findUnique.mockResolvedValue(MOCK_BUSINESS_USER);
    prismaMock.otpCode.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.otpCode.create.mockResolvedValue(MOCK_OTP_RECORD);

    const req = { body: { email: 'owner@cafe.com' } } as unknown as Request;
    const res = buildRes();
    await sendOTP(req, res);

    expect(prismaMock.otpCode.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─── verifyOTP ────────────────────────────────────────────────────────────────
describe('verifyOTP', () => {
  it('returns 404 when user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = { body: { email: 'nobody@cafe.com', otp: '654321' } } as unknown as Request;
    const res = buildRes();
    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when OTP is invalid', async () => {
    prismaMock.user.findUnique.mockResolvedValue(MOCK_BUSINESS_USER);
    prismaMock.otpCode.findFirst.mockResolvedValue(null);

    const req = { body: { email: 'owner@cafe.com', otp: '000000' } } as unknown as Request;
    const res = buildRes();
    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Invalid') }),
    );
  });

  it('returns 400 when OTP is expired', async () => {
    prismaMock.user.findUnique.mockResolvedValue(MOCK_BUSINESS_USER);
    prismaMock.otpCode.findFirst.mockResolvedValue({
      ...MOCK_OTP_RECORD,
      expiresAt: new Date(Date.now() - 1000),
    });

    const req = { body: { email: 'owner@cafe.com', otp: '654321' } } as unknown as Request;
    const res = buildRes();
    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('expired') }),
    );
  });

  it('returns 200 with tokens on successful verification', async () => {
    prismaMock.user.findUnique.mockResolvedValue(MOCK_BUSINESS_USER);
    prismaMock.otpCode.findFirst.mockResolvedValue(MOCK_OTP_RECORD);
    prismaMock.otpCode.update.mockResolvedValue({ ...MOCK_OTP_RECORD, isUsed: true });
    prismaMock.refreshToken.create.mockResolvedValue(MOCK_REFRESH_TOKEN);

    const req = { body: { email: 'owner@cafe.com', otp: '654321' } } as unknown as Request;
    const res = buildRes();
    await verifyOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      }),
    );
  });
});

// ─── resendOTP ────────────────────────────────────────────────────────────────
describe('resendOTP (business)', () => {
  it('returns 403 when no approved access request exists', async () => {
    prismaMock.businessAccessRequest.findFirst.mockResolvedValue(null);

    const req = { body: { email: 'owner@cafe.com' } } as unknown as Request;
    const res = buildRes();
    await resendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 404 when user record does not exist', async () => {
    prismaMock.businessAccessRequest.findFirst.mockResolvedValue(MOCK_APPROVED_REQUEST);
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = { body: { email: 'owner@cafe.com' } } as unknown as Request;
    const res = buildRes();
    await resendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('resends OTP and returns 200 on success', async () => {
    prismaMock.businessAccessRequest.findFirst.mockResolvedValue(MOCK_APPROVED_REQUEST);
    prismaMock.user.findUnique.mockResolvedValue(MOCK_BUSINESS_USER);
    prismaMock.otpCode.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.otpCode.create.mockResolvedValue(MOCK_OTP_RECORD);

    const req = { body: { email: 'owner@cafe.com' } } as unknown as Request;
    const res = buildRes();
    await resendOTP(req, res);

    expect(prismaMock.otpCode.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
