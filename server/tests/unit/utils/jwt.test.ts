// Must mock config/jwt before importing utils/jwt because the config
// module reads env variables at import time and throws if they are missing.
jest.mock('../../../src/config/jwt', () => ({
  jwtConfig: {
    secret: 'test-access-secret-32-chars-long!!',
    refreshSecret: 'test-refresh-secret-32-chars-long!',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
}));

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenExpirationDate,
} from '../../../src/utils/jwt';

const TEST_PAYLOAD = { userId: 1, email: 'test@example.com', role: 'user' };

describe('JWT Utils', () => {
  // ─── generateAccessToken ──────────────────────────────────────────────────
  describe('generateAccessToken', () => {
    it('returns a non-empty string', () => {
      const token = generateAccessToken(TEST_PAYLOAD);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('produces a three-part JWT (header.payload.signature)', () => {
      const token = generateAccessToken(TEST_PAYLOAD);
      expect(token.split('.')).toHaveLength(3);
    });
  });

  // ─── verifyAccessToken ────────────────────────────────────────────────────
  describe('verifyAccessToken', () => {
    it('decodes the original payload from a valid token', () => {
      const token = generateAccessToken(TEST_PAYLOAD);
      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(TEST_PAYLOAD.userId);
      expect(decoded.email).toBe(TEST_PAYLOAD.email);
      expect(decoded.role).toBe(TEST_PAYLOAD.role);
    });

    it('throws when passed a tampered token', () => {
      const token = generateAccessToken(TEST_PAYLOAD);
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyAccessToken(tampered)).toThrow();
    });

    it('throws when passed a completely invalid token', () => {
      expect(() => verifyAccessToken('not.a.jwt')).toThrow();
    });
  });

  // ─── generateRefreshToken ────────────────────────────────────────────────
  describe('generateRefreshToken', () => {
    it('returns a non-empty JWT string', () => {
      const token = generateRefreshToken(TEST_PAYLOAD);
      expect(token.split('.')).toHaveLength(3);
    });

    it('generates a different token than the access token for the same payload', () => {
      const access = generateAccessToken(TEST_PAYLOAD);
      const refresh = generateRefreshToken(TEST_PAYLOAD);
      // Different secrets → different signatures
      expect(access).not.toBe(refresh);
    });
  });

  // ─── verifyRefreshToken ───────────────────────────────────────────────────
  describe('verifyRefreshToken', () => {
    it('decodes the original payload from a valid refresh token', () => {
      const token = generateRefreshToken(TEST_PAYLOAD);
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(TEST_PAYLOAD.userId);
      expect(decoded.email).toBe(TEST_PAYLOAD.email);
    });

    it('throws when an access token is passed (wrong secret)', () => {
      const accessToken = generateAccessToken(TEST_PAYLOAD);
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });

  // ─── getRefreshTokenExpirationDate ───────────────────────────────────────
  describe('getRefreshTokenExpirationDate', () => {
    it('returns a Date object', () => {
      expect(getRefreshTokenExpirationDate()).toBeInstanceOf(Date);
    });

    it('is approximately 7 days in the future', () => {
      const now = Date.now();
      const expiry = getRefreshTokenExpirationDate().getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      // Allow ±5 second window for slow test machines
      expect(expiry).toBeGreaterThanOrEqual(now + sevenDaysMs - 5000);
      expect(expiry).toBeLessThanOrEqual(now + sevenDaysMs + 5000);
    });
  });
});
