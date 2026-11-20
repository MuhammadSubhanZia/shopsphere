import { str, isNumber, isWholeNumber } from './common.js';

/**
 * Checks product data sent by the admin form.
 * With { partial: true } only the fields that are present are checked
 * (used by PATCH, e.g. the inventory page sends just { stock }).
 */
export function validateProduct(body = {}, { partial = false } = {}) {
  const errors = {};
  const check = (field) => !partial || field in body;

  if (check('name') && str(body.name).length < 3) errors.name = 'Name must be at least 3 characters';
  if (check('category') && !str(body.category)) errors.category = 'Choose a category';
  if (check('brand') && !str(body.brand)) errors.brand = 'Brand is required';
  if (check('price') && !(isNumber(body.price) && body.price > 0)) errors.price = 'Enter a price greater than 0';
  if ('oldPrice' in body && body.oldPrice !== null && !(isNumber(body.oldPrice) && body.oldPrice > 0)) {
    errors.oldPrice = 'Old price must be a number greater than 0';
  }
  if (check('stock') && !(isWholeNumber(body.stock) && body.stock >= 0)) errors.stock = 'Stock must be a whole number, 0 or more';
  if (check('description') && str(body.description).length < 20) errors.description = 'Description should be at least 20 characters';

  if ('features' in body) {
    const ok = Array.isArray(body.features) && body.features.length <= 12 && body.features.every((f) => typeof f === 'string' && f.length <= 120);
    if (!ok) errors.features = 'Features must be a list of up to 12 short texts';
  }
  if ('icon' in body && !/^bi-[a-z0-9-]+$/.test(str(body.icon))) errors.icon = 'Invalid icon';
  if ('tint' in body && !(isNumber(body.tint) && body.tint >= 0 && body.tint <= 360)) errors.tint = 'Colour must be between 0 and 360';
  if ('featured' in body && typeof body.featured !== 'boolean') errors.featured = 'Featured must be true or false';
  return errors;
}

export const validateProductCreate = (body) => validateProduct(body);
export const validateProductUpdate = (body) => validateProduct(body, { partial: true });

export function validateCategory(body = {}) {
  const errors = {};
  if (str(body.name).length < 3) errors.name = 'Name must be at least 3 characters';
  if ('description' in body && (typeof body.description !== 'string' || body.description.trim().length > 120)) {
    errors.description = 'Keep the description under 120 characters';
  }
  if ('icon' in body && !/^bi-[a-z0-9-]+$/.test(str(body.icon))) errors.icon = 'Invalid icon';
  if ('tint' in body && !(isNumber(body.tint) && body.tint >= 0 && body.tint <= 360)) errors.tint = 'Colour must be between 0 and 360';
  return errors;
}
