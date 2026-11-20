import { str, isPhone, isStrongPassword } from './common.js';

/** Profile edit: every field is optional, but the ones that are sent must be valid. */
export function validateProfileUpdate(body = {}) {
  const errors = {};
  if ('name' in body && str(body.name).length < 3) errors.name = 'Name must be at least 3 characters';
  if ('phone' in body && !isPhone(body.phone)) errors.phone = 'Use a Pakistani mobile number, e.g. 0300-1234567';
  if ('address' in body) {
    const address = str(body.address);
    if (address && address.length < 8) errors.address = 'Please enter the full street address';
    if (address.length > 200) errors.address = 'Address is too long';
  }
  if ('city' in body && typeof body.city !== 'string') errors.city = 'Invalid city';

  if (body.newPassword !== undefined) {
    if (typeof body.currentPassword !== 'string' || !body.currentPassword) errors.currentPassword = 'Enter your current password';
    if (!isStrongPassword(body.newPassword)) errors.newPassword = 'Password does not meet all the requirements';
    else if (body.newPassword === body.currentPassword) errors.newPassword = 'New password must be different from the current one';
  }
  return errors;
}
