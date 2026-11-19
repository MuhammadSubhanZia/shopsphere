import mongoose from 'mongoose';

// One document per collection that needs readable, sequential ids (1, 2, 3 ...).
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "products"
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model('Counter', counterSchema);
