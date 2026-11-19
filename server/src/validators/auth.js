import { str, isEmail, isPhone, isStrongPassword } from './common.js';

// Every validate* function returns an object like { email: 'Email is required' }.
// An empty object means the data is valid. These repeat the checks done in the React
// forms: the browser checks are for fast feedback, these are the ones that count.

export function validateRegister(body = {}) {
  const errors = {};
  if (str(body.name).length < 3) errors.name = 'Name must be at least 3 characters';
  if (!isEmail(body.email)) errors.email = 'Enter a valid email address';
  if (!isPhone(body.phone)) errors.phone = 'Use a Pakistani mobile number, e.g. 0300-1234567';
  if (!isStrongPassword(body.password)) errors.password = 'Password must have 8+ characters with upper case, lower case and a number';
  return errors;
}

export function validateLogin(body = {}) {
  const errors = {};
  if (!isEmail(body.email)) errors.email = 'Enter a valid email address';
  if (typeof body.password !== 'string' || !body.password) errors.password = 'Password is required';
  return errors;
}
