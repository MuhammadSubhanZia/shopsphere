// Pricing rules shared by the cart, checkout and the mock API,
// so every screen shows exactly the same totals.

export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_FEE = 250;

export const PROMO_CODES = {
  SAVE10: { type: 'percent', value: 10, label: '10% off your order' },
  WELCOME200: { type: 'flat', value: 200, label: 'Rs. 200 off your order' },
  FREESHIP: { type: 'shipping', value: 0, label: 'Free delivery' },
};

export const normalizePromo = (code) => String(code || '').trim().toUpperCase();

export const isValidPromo = (code) => Boolean(PROMO_CODES[normalizePromo(code)]);

/**
 * Works out the order totals.
 * `items` is a list of { price, quantity }.
 */
export function calculateTotals(items, promoCode = null) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const promo = promoCode ? PROMO_CODES[normalizePromo(promoCode)] : null;

  let discount = 0;
  if (promo?.type === 'percent') discount = Math.round((subtotal * promo.value) / 100);
  if (promo?.type === 'flat') discount = Math.min(promo.value, subtotal);

  const freeShipping = promo?.type === 'shipping' || subtotal - discount >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = subtotal === 0 || freeShipping ? 0 : SHIPPING_FEE;

  return {
    subtotal,
    discount,
    shippingFee,
    total: subtotal - discount + shippingFee,
    itemCount,
    amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - (subtotal - discount)),
  };
}
