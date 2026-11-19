import mongoose from 'mongoose';
import { cleanJson } from '../utils/toJson.js';

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: [true, 'Product name is required'], trim: true, minlength: [3, 'Name must be at least 3 characters'], maxlength: 120 },
    category: { type: String, required: [true, 'Choose a category'], trim: true, index: true }, // category slug
    brand: { type: String, required: [true, 'Brand is required'], trim: true, maxlength: 60 },
    price: { type: Number, required: [true, 'Price is required'], min: [1, 'Price must be greater than 0'] },
    oldPrice: { type: Number, default: null },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, min: 0, default: 0 },
    stock: { type: Number, required: true, min: [0, 'Stock cannot be negative'], validate: { validator: Number.isInteger, message: 'Stock must be a whole number' } },
    featured: { type: Boolean, default: false },
    icon: { type: String, default: 'bi-box-seam' },
    tint: { type: Number, min: 0, max: 360, default: 20 },
    description: { type: String, required: [true, 'Add a short description'], trim: true, maxlength: 1000 },
    features: { type: [String], default: [] },
  },
  { timestamps: true, id: false, toJSON: cleanJson }
);

export const Product = mongoose.model('Product', productSchema);
