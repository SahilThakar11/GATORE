import {
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
  isValidCardNumber,
  formatCardNumber,
  isValidExpiryDate,
  formatExpiryDate,
  isValidCVV,
  formatCurrency,
  getCardType,
} from '../../../src/utils/validation';

// ─── isValidEmail ─────────────────────────────────────────────────────────────
describe('isValidEmail', () => {
  it('returns true for a standard email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('returns true for subdomain emails', () => {
    expect(isValidEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('returns false for missing @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('returns false for missing domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('returns false when there are spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});

// ─── isValidPhone ─────────────────────────────────────────────────────────────
describe('isValidPhone', () => {
  it('returns true for a correctly formatted phone number', () => {
    expect(isValidPhone('416-555-1234')).toBe(true);
  });

  it('returns false for a number without dashes', () => {
    expect(isValidPhone('4165551234')).toBe(false);
  });

  it('returns false for a number with incorrect grouping', () => {
    expect(isValidPhone('41-6555-1234')).toBe(false);
  });

  it('returns false for letters in the number', () => {
    expect(isValidPhone('416-ABC-1234')).toBe(false);
  });
});

// ─── formatPhoneNumber ────────────────────────────────────────────────────────
describe('formatPhoneNumber', () => {
  it('returns digits as-is when fewer than 4 chars', () => {
    expect(formatPhoneNumber('416')).toBe('416');
  });

  it('inserts a dash after the first 3 digits', () => {
    expect(formatPhoneNumber('4165')).toBe('416-5');
  });

  it('formats a full 10-digit number as XXX-XXX-XXXX', () => {
    expect(formatPhoneNumber('4165551234')).toBe('416-555-1234');
  });

  it('strips non-numeric characters before formatting', () => {
    expect(formatPhoneNumber('416 555 1234')).toBe('416-555-1234');
  });

  it('truncates to 10 digits', () => {
    expect(formatPhoneNumber('41655512349999')).toBe('416-555-1234');
  });
});

// ─── isValidCardNumber (Luhn algorithm) ──────────────────────────────────────
describe('isValidCardNumber', () => {
  // Classic Luhn-valid test numbers
  it('returns true for a valid Visa test number', () => {
    expect(isValidCardNumber('4532015112830366')).toBe(true);
  });

  it('returns true for a valid Mastercard test number', () => {
    expect(isValidCardNumber('5425233430109903')).toBe(true);
  });

  it('returns true for a number with spaces (stripped before check)', () => {
    expect(isValidCardNumber('4532 0151 1283 0366')).toBe(true);
  });

  it('returns false for a number that fails the Luhn check', () => {
    expect(isValidCardNumber('1234567890123456')).toBe(false);
  });

  it('returns false for a number shorter than 13 digits', () => {
    expect(isValidCardNumber('123456789012')).toBe(false);
  });

  it('returns false for a number longer than 19 digits', () => {
    expect(isValidCardNumber('12345678901234567890')).toBe(false);
  });
});

// ─── formatCardNumber ─────────────────────────────────────────────────────────
describe('formatCardNumber', () => {
  it('groups digits into sets of 4', () => {
    expect(formatCardNumber('4532015112830366')).toBe('4532 0151 1283 0366');
  });

  it('handles partial input (fewer than 16 digits)', () => {
    expect(formatCardNumber('4532')).toBe('4532');
  });

  it('handles input already containing spaces', () => {
    expect(formatCardNumber('4532 0151')).toBe('4532 0151');
  });
});

// ─── isValidExpiryDate ────────────────────────────────────────────────────────
describe('isValidExpiryDate', () => {
  it('returns true for a future expiry date', () => {
    const futureYear = (new Date().getFullYear() % 100) + 2;
    const future = `12/${String(futureYear).padStart(2, '0')}`;
    expect(isValidExpiryDate(future)).toBe(true);
  });

  it('returns false for a past expiry year', () => {
    expect(isValidExpiryDate('01/20')).toBe(false);
  });

  it('returns false for month 00', () => {
    const futureYear = (new Date().getFullYear() % 100) + 2;
    expect(isValidExpiryDate(`00/${futureYear}`)).toBe(false);
  });

  it('returns false for month 13', () => {
    const futureYear = (new Date().getFullYear() % 100) + 2;
    expect(isValidExpiryDate(`13/${futureYear}`)).toBe(false);
  });

  it('returns false for incorrect format (no slash)', () => {
    expect(isValidExpiryDate('1228')).toBe(false);
  });
});

// ─── formatExpiryDate ─────────────────────────────────────────────────────────
describe('formatExpiryDate', () => {
  it('returns digits as-is when fewer than 3 characters', () => {
    expect(formatExpiryDate('12')).toBe('12');
  });

  it('inserts a slash after the first 2 digits', () => {
    expect(formatExpiryDate('123')).toBe('12/3');
  });

  it('formats a full MM/YY expiry', () => {
    expect(formatExpiryDate('1228')).toBe('12/28');
  });

  it('strips non-numeric characters before formatting', () => {
    expect(formatExpiryDate('12/28')).toBe('12/28');
  });
});

// ─── isValidCVV ───────────────────────────────────────────────────────────────
describe('isValidCVV', () => {
  it('returns true for a 3-digit CVV', () => {
    expect(isValidCVV('123')).toBe(true);
  });

  it('returns true for a 4-digit CVV (Amex)', () => {
    expect(isValidCVV('1234')).toBe(true);
  });

  it('returns false for a 2-digit value', () => {
    expect(isValidCVV('12')).toBe(false);
  });

  it('returns false for a 5-digit value', () => {
    expect(isValidCVV('12345')).toBe(false);
  });

  it('returns false for non-numeric characters', () => {
    expect(isValidCVV('12a')).toBe(false);
  });
});

// ─── formatCurrency ───────────────────────────────────────────────────────────
describe('formatCurrency', () => {
  it('formats a whole number with two decimal places', () => {
    expect(formatCurrency(10)).toBe('$10.00');
  });

  it('formats a decimal amount', () => {
    expect(formatCurrency(9.99)).toBe('$9.99');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

// ─── getCardType ──────────────────────────────────────────────────────────────
describe('getCardType', () => {
  it('identifies Visa (starts with 4)', () => {
    expect(getCardType('4111111111111111')).toBe('visa');
  });

  it('identifies Mastercard (starts with 51-55)', () => {
    expect(getCardType('5500005555555559')).toBe('mastercard');
  });

  it('identifies Amex (starts with 34 or 37)', () => {
    expect(getCardType('371449635398431')).toBe('amex');
  });

  it('identifies Discover (starts with 6011 or 65)', () => {
    expect(getCardType('6011000990139424')).toBe('discover');
  });

  it('returns "unknown" for unrecognised prefix', () => {
    expect(getCardType('9999999999999999')).toBe('unknown');
  });
});
