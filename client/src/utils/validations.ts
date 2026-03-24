/** Returns null if valid, or an error message string if invalid. */

export const validateRequired = (v: string | undefined): string | null => {
  if (!v || !v.trim()) return "This field is required.";
  return null;
};

export const validateEmail = (v: string | undefined): string | null => {
  if (!v || !v.trim()) return "Email is required.";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(v.trim())) return "Enter a valid email address.";
  return null;
};

export const validatePhone = (v: string | undefined): string | null => {
  if (!v || !v.trim()) return null; // optional
  const digits = v.replace(/\D/g, "");
  if (digits.length < 10) return "Phone number must have at least 10 digits.";
  return null;
};

export const validateUrl = (v: string | undefined): string | null => {
  if (!v || !v.trim()) return null; // optional
  try {
    const url = new URL(v.trim());
    if (!["http:", "https:"].includes(url.protocol)) {
      return "URL must start with http:// or https://";
    }
    return null;
  } catch {
    return "Enter a valid URL (e.g. https://example.com)";
  }
};

export const validatePostalCode = (v: string | undefined): string | null => {
  if (!v || !v.trim()) return null; // optional
  const re = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  if (!re.test(v.trim())) return "Enter a valid Canadian postal code (e.g. A1A 1A1).";
  return null;
};

export const validatePositiveNumber = (
  v: string | undefined,
  label = "Value"
): string | null => {
  if (!v || !v.trim()) return `${label} is required.`;
  const num = parseFloat(v.trim());
  if (isNaN(num) || num <= 0) return `${label} must be a positive number.`;
  return null;
};

/** Run multiple validators, return first error found or null */
export const firstError = (...results: (string | null)[]): string | null => {
  return results.find((r) => r !== null) ?? null;
};
