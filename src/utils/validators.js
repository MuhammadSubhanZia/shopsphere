// Form validation helpers.
//
// Every validate* function takes the form values and returns an object like
// { email: 'Email is required' }. An empty object means the form is valid.
// Validation is always repeated by the server in a real app; this is only for fast feedback.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmail = (value = '') => EMAIL_PATTERN.test(value.trim());

// Pakistani mobile numbers: 0300-1234567, 03001234567 or +92 300 1234567
export const isPhone = (value = '') => /^(\+92|0)3\d{9}$/.test(value.replace(/[\s-]/g, ''));

export const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { key: 'lower', label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { key: 'number', label: 'One number', test: (value) => /\d/.test(value) },
];

export const isStrongPassword = (value = '') => PASSWORD_RULES.every((rule) => rule.test(value));

/** Luhn checksum – the same check card processors use to catch typos. */
export function isValidCardNumber(value = '') {
  const digits = value.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  [...digits].reverse().forEach((digit, index) => {
    let number = Number(digit);
    if (index % 2 === 1) {
      number *= 2;
      if (number > 9) number -= 9;
    }
    sum += number;
  });
  return sum % 10 === 0;
}

/** "08/29" -> true while that month has not finished yet. */
export function isValidExpiry(value = '') {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  return new Date(year, month, 0, 23, 59, 59) >= new Date();
}

// ---------- Forms ----------

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Email is required';
  else if (!isEmail(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
}

export function validateRegister({ name, email, phone, password, confirmPassword, terms }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Full name is required';
  else if (name.trim().length < 3) errors.name = 'Name must be at least 3 characters';

  if (!email.trim()) errors.email = 'Email is required';
  else if (!isEmail(email)) errors.email = 'Enter a valid email address';

  if (!phone.trim()) errors.phone = 'Phone number is required';
  else if (!isPhone(phone)) errors.phone = 'Use a Pakistani mobile number, e.g. 0300-1234567';

  if (!password) errors.password = 'Password is required';
  else if (!isStrongPassword(password)) errors.password = 'Password does not meet all the requirements';

  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';

  if (!terms) errors.terms = 'You must accept the terms to continue';
  return errors;
}

export function validateShipping({ fullName, phone, address, city, postalCode }) {
  const errors = {};
  if (!fullName.trim()) errors.fullName = 'Full name is required';
  if (!phone.trim()) errors.phone = 'Phone number is required';
  else if (!isPhone(phone)) errors.phone = 'Use a Pakistani mobile number, e.g. 0300-1234567';
  if (!address.trim()) errors.address = 'Delivery address is required';
  else if (address.trim().length < 8) errors.address = 'Please enter the full street address';
  if (!city) errors.city = 'Please choose your city';
  if (postalCode.trim() && !/^\d{5}$/.test(postalCode.trim())) errors.postalCode = 'Postal code must be 5 digits';
  return errors;
}

export function validatePayment({ method, cardNumber, cardName, expiry, cvv }) {
  if (method !== 'card') return {};
  const errors = {};
  if (!isValidCardNumber(cardNumber)) errors.cardNumber = 'Enter a valid card number';
  if (!cardName.trim()) errors.cardName = 'Name on card is required';
  if (!isValidExpiry(expiry)) errors.expiry = 'Use a future date as MM/YY';
  if (!/^\d{3,4}$/.test(cvv)) errors.cvv = '3 or 4 digits';
  return errors;
}

export function validateProfile({ name, phone, address, city }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Full name is required';
  else if (name.trim().length < 3) errors.name = 'Name must be at least 3 characters';
  if (!phone.trim()) errors.phone = 'Phone number is required';
  else if (!isPhone(phone)) errors.phone = 'Use a Pakistani mobile number, e.g. 0300-1234567';
  if (address.trim() && address.trim().length < 8) errors.address = 'Please enter the full street address';
  if (address.trim() && !city) errors.city = 'Please choose your city';
  return errors;
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};
  if (!currentPassword) errors.currentPassword = 'Enter your current password';
  if (!newPassword) errors.newPassword = 'Enter a new password';
  else if (!isStrongPassword(newPassword)) errors.newPassword = 'Password does not meet all the requirements';
  else if (newPassword === currentPassword) errors.newPassword = 'New password must be different from the current one';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm the new password';
  else if (confirmPassword !== newPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

// ---------- Admin forms ----------

export function validateProduct({ name, category, brand, price, oldPrice, stock, description }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Product name is required';
  else if (name.trim().length < 3) errors.name = 'Name must be at least 3 characters';
  if (!category) errors.category = 'Choose a category';
  if (!brand.trim()) errors.brand = 'Brand is required';

  if (price === '' || Number(price) <= 0) errors.price = 'Enter a price greater than 0';
  if (oldPrice !== '' && Number(oldPrice) <= Number(price)) errors.oldPrice = 'Old price must be higher than the price';

  if (stock === '' || !Number.isInteger(Number(stock)) || Number(stock) < 0) errors.stock = 'Stock must be a whole number, 0 or more';
  if (!description.trim()) errors.description = 'Add a short description';
  else if (description.trim().length < 20) errors.description = 'Description should be at least 20 characters';
  return errors;
}

export function validateCategory({ name, description }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Category name is required';
  else if (name.trim().length < 3) errors.name = 'Name must be at least 3 characters';
  if (description.trim().length > 120) errors.description = 'Keep the description under 120 characters';
  return errors;
}
