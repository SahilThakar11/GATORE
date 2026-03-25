import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuthenticate, authorize } from '../../../src/middleware/auth';
import { AuthRequest } from '../../../src/types/express';

// Mock the JWT utility so tests don't need real env secrets
jest.mock('../../../src/utils/jwt', () => ({
  verifyAccessToken: jest.fn(),
}));

import { verifyAccessToken } from '../../../src/utils/jwt';
const mockVerifyAccessToken = verifyAccessToken as jest.MockedFunction<typeof verifyAccessToken>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildRequest(authHeader?: string): AuthRequest {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  } as unknown as AuthRequest;
}

function buildResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const next: NextFunction = jest.fn();

// ─── authenticate ─────────────────────────────────────────────────────────────
describe('authenticate middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('responds 401 when Authorization header is absent', async () => {
    const req = buildRequest();
    const res = buildResponse();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 401 when Authorization header does not start with "Bearer "', async () => {
    const req = buildRequest('Basic some-token');
    const res = buildResponse();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 401 when the token is invalid (verifyAccessToken throws)', async () => {
    mockVerifyAccessToken.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const req = buildRequest('Bearer bad.token.here');
    const res = buildResponse();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and attaches user to req when token is valid', async () => {
    const payload = { userId: 42, email: 'user@test.com', role: 'user' };
    mockVerifyAccessToken.mockReturnValue(payload);

    const req = buildRequest('Bearer valid.token.here');
    const res = buildResponse();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(payload);
  });
});

// ─── optionalAuthenticate ─────────────────────────────────────────────────────
describe('optionalAuthenticate middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls next() without setting req.user when no header is present', async () => {
    const req = buildRequest();
    const res = buildResponse();

    await optionalAuthenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
  });

  it('sets req.user and calls next() when a valid token is provided', async () => {
    const payload = { userId: 7, email: 'owner@test.com', role: 'business' };
    mockVerifyAccessToken.mockReturnValue(payload);

    const req = buildRequest('Bearer valid.token.here');
    const res = buildResponse();

    await optionalAuthenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(payload);
  });

  it('still calls next() (as unauthenticated) when token is invalid', async () => {
    mockVerifyAccessToken.mockImplementation(() => {
      throw new Error('expired');
    });

    const req = buildRequest('Bearer expired.token.here');
    const res = buildResponse();

    await optionalAuthenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
  });
});

// ─── authorize ───────────────────────────────────────────────────────────────
describe('authorize middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('responds 401 when req.user is not set', () => {
    const req = buildRequest();
    const res = buildResponse();
    const handler = authorize('admin');

    handler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 403 when the user role is not in the allowed list', () => {
    const req = buildRequest();
    (req as AuthRequest).user = { userId: 1, email: 'u@t.com', role: 'user' };
    const res = buildResponse();
    const handler = authorize('admin', 'business');

    handler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when the user role is allowed', () => {
    const req = buildRequest();
    (req as AuthRequest).user = { userId: 1, email: 'u@t.com', role: 'admin' };
    const res = buildResponse();
    const handler = authorize('admin', 'business');

    handler(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('calls next() when one of multiple allowed roles matches', () => {
    const req = buildRequest();
    (req as AuthRequest).user = { userId: 2, email: 'b@t.com', role: 'business' };
    const res = buildResponse();
    const handler = authorize('admin', 'business');

    handler(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
