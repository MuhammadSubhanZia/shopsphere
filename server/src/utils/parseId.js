import { ApiError } from './ApiError.js';

/** Reads a numeric id from a URL parameter ("12" -> 12). Anything else is a 404 for that resource. */
export function parseId(value, label = 'Item') {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new ApiError(`${label} not found`, 404);
  return id;
}
