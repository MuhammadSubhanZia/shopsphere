import mongoose from 'mongoose';
import { cleanJson } from '../utils/toJson.js';

const categorySchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: [true, 'Category name is required'], trim: true, minlength: [3, 'Name must be at least 3 characters'], maxlength: 40 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: 'bi-tag' },
    tint: { type: Number, min: 0, max: 360, default: 20 },
    description: { type: String, trim: true, maxlength: [120, 'Keep the description under 120 characters'], default: '' },
  },
  { timestamps: true, id: false, toJSON: cleanJson }
);

export const Category = mongoose.model('Category', categorySchema);
