// Small helpers shared by every validator.
// Validators never trust the shape of req.body: a field may be missing, a number or an object.

/** Returns the trimmed string, or '' when the value is not a string. */
export const str = (value) => (typeof value === 'string' ? value.trim() : '');

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(str(value));

// Pakistani mobile numbers: 0300-1234567, 03001234567 or +92 300 1234567
export const isPhone = (value) => /^(\+92|0)3\d{9}$/.test(str(value).replace(/[\s-]/g, ''));

export const isStrongPassword = (value) =>
  typeof value === 'string' && value.length >= 8 && value.length <= 72 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);

export const isWholeNumber = (value) => typeof value === 'number' && Number.isInteger(value);

export const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);
