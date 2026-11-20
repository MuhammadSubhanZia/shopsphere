import { str, isPhone, isWholeNumber } from './common.js';
import { isValidPromo } from '../utils/pricing.js';
import { ORDER_STATUSES } from '../utils/orderStatus.js';

/**
 * Checks the order sent by the checkout page. Note what is NOT in here: prices and totals.
 * The browser only sends product ids and quantities, the server looks the prices up itself.
 */
export function validateOrder(body = {}) {
  const errors = {};

  const { items, shipping, paymentMethod, cardLast4, promoCode } = body;
  const validItems =
    Array.isArray(items) &&
    items.length >= 1 &&
    items.length <= 50 &&
    items.every((item) => item && isWholeNumber(item.productId) && isWholeNumber(item.quantity) && item.quantity >= 1 && item.quantity <= 99);
  if (!validItems) errors.items = 'Your cart is empty or contains an invalid item';

  if (!shipping || typeof shipping !== 'object') {
    errors.shipping = 'Delivery details are required';
  } else {
    if (!str(shipping.fullName)) errors.fullName = 'Full name is required';
    if (!isPhone(shipping.phone)) errors.phone = 'Use a Pakistani mobile number, e.g. 0300-1234567';
    if (str(shipping.address).length < 8) errors.address = 'Please enter the full street address';
    if (!str(shipping.city)) errors.city = 'Please choose your city';
    if (str(shipping.postalCode) && !/^\d{5}$/.test(str(shipping.postalCode))) errors.postalCode = 'Postal code must be 5 digits';
    if (str(shipping.notes).length > 300) errors.notes = 'Delivery notes are too long';
  }

  if (!['cod', 'card'].includes(paymentMethod)) errors.paymentMethod = 'Choose a payment method';
  if (paymentMethod === 'card' && !/^\d{4}$/.test(str(cardLast4))) errors.cardLast4 = 'Card details are missing';

  if (promoCode && !isValidPromo(promoCode)) errors.promoCode = 'This promo code is not valid';
  return errors;
}

export function validateStatus(body = {}) {
  return ORDER_STATUSES.includes(body.status) ? {} : { status: 'Invalid order status' };
}
