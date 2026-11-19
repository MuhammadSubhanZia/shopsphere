import mongoose from 'mongoose';
import { cleanJson } from '../utils/toJson.js';

// A copy ("snapshot") of the product as it was when the order was placed,
// so later price changes or deleted products never alter an old order.
const lineSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    category: String,
    icon: String,
    tint: Number,
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true, index: true },
    customer: {
      name: String,
      email: String,
      phone: String,
    },
    items: { type: [lineSchema], validate: [(items) => items.length > 0, 'An order needs at least one item'] },
    shipping: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    paymentMethod: { type: String, enum: ['cod', 'card'], required: true },
    cardLast4: { type: String, default: null }, // the full card number is never sent to the server
    promoCode: { type: String, default: null },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    history: { type: [historySchema], default: [] },
  },
  { timestamps: true, id: false, toJSON: cleanJson }
);

export const Order = mongoose.model('Order', orderSchema);
