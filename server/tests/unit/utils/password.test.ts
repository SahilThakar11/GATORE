import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from '../../../src/utils/password';

describe('Password Utils', () => {
  // ─── hashPassword ─────────────────────────────────────────────────────────
  describe('hashPassword', () => {
    it('returns a non-empty string', async () => {
      const hash = await hashPassword('SecurePass1');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('produces a bcrypt hash (starts with $2b$)', async () => {
      const hash = await hashPassword('SecurePass1');
      expect(hash.startsWith('$2b$')).toBe(true);
    });

    it('returns different hashes for the same password (salted)', async () => {
      const hash1 = await hashPassword('SecurePass1');
      const hash2 = await hashPassword('SecurePass1');
      expect(hash1).not.toBe(hash2);
    });
  });

  // ─── comparePassword ──────────────────────────────────────────────────────
  describe('comparePassword', () => {
    it('returns true when the plain-text matches the hash', async () => {
      const password = 'MySecret99!';
      const hash = await hashPassword(password);
      expect(await comparePassword(password, hash)).toBe(true);
    });

    it('returns false when the plain-text does not match the hash', async () => {
      const hash = await hashPassword('CorrectPass1');
      expect(await comparePassword('WrongPass1', hash)).toBe(false);
    });

    it('returns false for an empty string against a real hash', async () => {
      const hash = await hashPassword('SomePass1');
      expect(await comparePassword('', hash)).toBe(false);
    });
  });

  // ─── validatePasswordStrength ─────────────────────────────────────────────
  describe('validatePasswordStrength', () => {
    it('returns isValid=true for a strong password', () => {
      const result = validatePasswordStrength('Secure123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails when password is shorter than 8 characters', () => {
      const result = validatePasswordStrength('Abc1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('fails when password has no uppercase letter', () => {
      const result = validatePasswordStrength('nouppercase1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('fails when password has no lowercase letter', () => {
      const result = validatePasswordStrength('NOLOWERCASE1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('fails when password has no digit', () => {
      const result = validatePasswordStrength('NoDigitsHere');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('returns multiple errors for a completely weak password', () => {
      const result = validatePasswordStrength('abc');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
