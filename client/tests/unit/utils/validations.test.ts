import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateUrl,
  validatePostalCode,
  validatePositiveNumber,
  firstError,
} from '../../../src/utils/validations';

// ─── validateRequired ─────────────────────────────────────────────────────────
describe('validateRequired', () => {
  it('returns null for a non-empty string', () => {
    expect(validateRequired('hello')).toBeNull();
  });

  it('returns an error message for an empty string', () => {
    expect(validateRequired('')).not.toBeNull();
  });

  it('returns an error message for a whitespace-only string', () => {
    expect(validateRequired('   ')).not.toBeNull();
  });

  it('returns an error message for undefined', () => {
    expect(validateRequired(undefined)).not.toBeNull();
  });
});

// ─── validateEmail ────────────────────────────────────────────────────────────
describe('validateEmail', () => {
  it('returns null for a valid email address', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });

  it('returns an error for an email without a domain', () => {
    expect(validateEmail('user@')).not.toBeNull();
  });

  it('returns an error for an email without @', () => {
    expect(validateEmail('userexample.com')).not.toBeNull();
  });

  it('returns an error for empty string', () => {
    expect(validateEmail('')).not.toBeNull();
  });

  it('returns an error for undefined', () => {
    expect(validateEmail(undefined)).not.toBeNull();
  });

  it('returns an error for whitespace only', () => {
    expect(validateEmail('   ')).not.toBeNull();
  });
});

// ─── validatePhone ────────────────────────────────────────────────────────────
describe('validatePhone', () => {
  it('returns null when phone is empty (optional field)', () => {
    expect(validatePhone('')).toBeNull();
  });

  it('returns null when phone is undefined (optional field)', () => {
    expect(validatePhone(undefined)).toBeNull();
  });

  it('returns null for a valid 10-digit phone number', () => {
    expect(validatePhone('4165551234')).toBeNull();
  });

  it('returns null for a formatted phone with dashes', () => {
    expect(validatePhone('416-555-1234')).toBeNull();
  });

  it('returns an error when phone has fewer than 10 digits', () => {
    expect(validatePhone('416-555')).not.toBeNull();
  });
});

// ─── validateUrl ──────────────────────────────────────────────────────────────
describe('validateUrl', () => {
  it('returns null when URL is empty (optional field)', () => {
    expect(validateUrl('')).toBeNull();
  });

  it('returns null for a valid https URL', () => {
    expect(validateUrl('https://example.com')).toBeNull();
  });

  it('returns null for a valid http URL', () => {
    expect(validateUrl('http://example.com/path?q=1')).toBeNull();
  });

  it('returns an error for a URL without a protocol', () => {
    expect(validateUrl('example.com')).not.toBeNull();
  });

  it('returns an error for a URL with a non-http/https protocol', () => {
    expect(validateUrl('ftp://example.com')).not.toBeNull();
  });

  it('returns an error for completely invalid input', () => {
    expect(validateUrl('not a url at all')).not.toBeNull();
  });
});

// ─── validatePostalCode ───────────────────────────────────────────────────────
describe('validatePostalCode', () => {
  it('returns null when value is empty (optional field)', () => {
    expect(validatePostalCode('')).toBeNull();
  });

  it('returns null for a valid Canadian postal code with space', () => {
    expect(validatePostalCode('M5V 3A8')).toBeNull();
  });

  it('returns null for a valid Canadian postal code without space', () => {
    expect(validatePostalCode('M5V3A8')).toBeNull();
  });

  it('returns null for a postal code with hyphen separator', () => {
    expect(validatePostalCode('M5V-3A8')).toBeNull();
  });

  it('returns an error for a US ZIP code', () => {
    expect(validatePostalCode('10001')).not.toBeNull();
  });

  it('returns an error for an invalid format', () => {
    expect(validatePostalCode('ABCDEF')).not.toBeNull();
  });
});

// ─── validatePositiveNumber ───────────────────────────────────────────────────
describe('validatePositiveNumber', () => {
  it('returns null for a valid positive number string', () => {
    expect(validatePositiveNumber('42')).toBeNull();
  });

  it('returns null for a positive decimal', () => {
    expect(validatePositiveNumber('9.99')).toBeNull();
  });

  it('returns an error for zero', () => {
    expect(validatePositiveNumber('0')).not.toBeNull();
  });

  it('returns an error for a negative number', () => {
    expect(validatePositiveNumber('-5')).not.toBeNull();
  });

  it('returns an error for non-numeric input', () => {
    expect(validatePositiveNumber('abc')).not.toBeNull();
  });

  it('returns an error for an empty string', () => {
    expect(validatePositiveNumber('')).not.toBeNull();
  });

  it('includes the label in the error message when provided', () => {
    const err = validatePositiveNumber('', 'Price');
    expect(err).toContain('Price');
  });
});

// ─── firstError ───────────────────────────────────────────────────────────────
describe('firstError', () => {
  it('returns null when all validators pass', () => {
    expect(firstError(null, null, null)).toBeNull();
  });

  it('returns the first non-null error', () => {
    expect(firstError(null, 'First error', 'Second error')).toBe('First error');
  });

  it('returns the only error when one validator fails', () => {
    expect(firstError(null, null, 'Only error')).toBe('Only error');
  });

  it('returns null for an empty argument list', () => {
    expect(firstError()).toBeNull();
  });
});
