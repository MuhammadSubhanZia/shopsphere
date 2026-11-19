import { Counter } from '../models/Counter.js';

/**
 * Returns the next number in a named sequence ("products" -> 37).
 * `$inc` runs atomically inside MongoDB, so two requests can never receive the same id.
 */
export async function nextId(name) {
  const counter = await Counter.findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return counter.seq;
}

/** Makes sure the next id is higher than every id already stored (used by the seed script). */
export async function setSequence(name, value) {
  await Counter.findOneAndUpdate({ _id: name }, { $set: { seq: value } }, { upsert: true });
}
