import {
  generateOTP,
  getOTPExpirationTime,
  isOTPExpired,
} from '../../../src/utils/otp';

describe('OTP Utils', () => {
  // ─── generateOTP ─────────────────────────────────────────────────────────
  describe('generateOTP', () => {
    it('returns a string', () => {
      expect(typeof generateOTP()).toBe('string');
    });

    it('is exactly 6 characters long', () => {
      expect(generateOTP()).toHaveLength(6);
    });

    it('contains only digits', () => {
      const otp = generateOTP();
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('generates different values on successive calls (not constant)', () => {
      const otps = new Set(Array.from({ length: 20 }, generateOTP));
      // With 900,000 possibilities, 20 calls should almost never all collide
      expect(otps.size).toBeGreaterThan(1);
    });
  });

  // ─── getOTPExpirationTime ────────────────────────────────────────────────
  describe('getOTPExpirationTime', () => {
    it('returns a Date object', () => {
      expect(getOTPExpirationTime()).toBeInstanceOf(Date);
    });

    it('is approximately 10 minutes in the future', () => {
      const now = Date.now();
      const expiry = getOTPExpirationTime().getTime();
      const tenMinutesMs = 10 * 60 * 1000;
      // Allow ±2 second window
      expect(expiry).toBeGreaterThanOrEqual(now + tenMinutesMs - 2000);
      expect(expiry).toBeLessThanOrEqual(now + tenMinutesMs + 2000);
    });
  });

  // ─── isOTPExpired ─────────────────────────────────────────────────────────
  describe('isOTPExpired', () => {
    it('returns false when the expiry date is in the future', () => {
      const future = new Date(Date.now() + 5 * 60 * 1000); // 5 min from now
      expect(isOTPExpired(future)).toBe(false);
    });

    it('returns true when the expiry date is in the past', () => {
      const past = new Date(Date.now() - 1000); // 1 second ago
      expect(isOTPExpired(past)).toBe(true);
    });

    it('returns true for a date exactly at Unix epoch (long expired)', () => {
      expect(isOTPExpired(new Date(0))).toBe(true);
    });
  });
});
