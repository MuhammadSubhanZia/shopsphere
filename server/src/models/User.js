import mongoose from 'mongoose';
import { cleanJson } from '../utils/toJson.js';

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: [3, 'Name must be at least 3 characters'], maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Enter a valid email address'],
    },
    // Only the bcrypt hash is stored. It is never selected or returned unless explicitly asked for.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '', maxlength: 200 },
    city: { type: String, trim: true, default: '' },
  },
  { timestamps: true, id: false, toJSON: cleanJson }
);

export const User = mongoose.model('User', userSchema);
