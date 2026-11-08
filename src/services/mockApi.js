// Mock API layer.
//
// The real back-end (Node / Express / MongoDB) is Phase 2 of the project. Until then
// every "request" is a Promise that resolves after a short delay and reads / writes
// localStorage, so the UI is written exactly as if it were talking to a server:
// loading states, async/await and error handling all behave realistically.
// When the back-end is ready only this file changes (fetch calls replace the localStorage reads).

import { loadState, saveState } from './storage.js';
import { categories as seedCategories } from '../data/categories.js';
import { products as seedProducts } from '../data/products.js';
import { slugify } from '../utils/formatters.js';
import { calculateTotals } from '../utils/pricing.js';
import { ORDER_FLOW, ORDER_STATUSES, canCancel } from '../utils/orderStatus.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LATENCY = 350; // ms – simulated network delay
const delay = (ms = LATENCY) => new Promise((resolve) => setTimeout(resolve, ms));

/** Error type thrown by every API function (mirrors an HTTP error response). */
export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Reads a collection from localStorage, seeding it the first time it is used.
function read(key, seed) {
  const stored = loadState(key, null);
  if (Array.isArray(stored)) return stored;
  saveState(key, seed);
  return seed;
}

const write = (key, data) => saveState(key, data);

const nextId = (list) => list.reduce((max, item) => Math.max(max, Number(item.id)), 0) + 1;

const today = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const readProducts = () => read('products', seedProducts);

export async function getProducts() {
  await delay();
  return readProducts();
}

export async function getProductById(id) {
  await delay(150);
  const product = readProducts().find((p) => p.id === Number(id));
  if (!product) throw new ApiError('Product not found', 404);
  return product;
}

export async function createProduct(data) {
  await delay(250);
  const list = readProducts();
  const product = {
    rating: 0,
    reviews: 0,
    featured: false,
    oldPrice: null,
    icon: 'bi-box-seam',
    tint: 20,
    features: [],
    ...data,
    id: nextId(list),
    createdAt: today(),
  };
  write('products', [product, ...list]);
  return product;
}

export async function updateProduct(id, changes) {
  await delay(250);
  const list = readProducts();
  const current = list.find((p) => p.id === Number(id));
  if (!current) throw new ApiError('Product not found', 404);
  const updated = { ...current, ...changes, id: current.id };
  write('products', list.map((p) => (p.id === updated.id ? updated : p)));
  return updated;
}

export async function deleteProduct(id) {
  await delay(250);
  const list = readProducts();
  if (!list.some((p) => p.id === Number(id))) throw new ApiError('Product not found', 404);
  write('products', list.filter((p) => p.id !== Number(id)));
  return Number(id);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const readCategories = () => read('categories', seedCategories);

export async function getCategories() {
  await delay(200);
  return readCategories();
}

export async function createCategory({ name, icon = 'bi-tag', tint = 20, description = '' }) {
  await delay(250);
  const list = readCategories();
  const slug = slugify(name);
  if (list.some((c) => c.slug === slug)) throw new ApiError('A category with this name already exists', 409);
  const category = { id: nextId(list), name: name.trim(), slug, icon, tint, description: description.trim() };
  write('categories', [...list, category]);
  return category;
}

export async function updateCategory(id, { name, icon, tint, description }) {
  await delay(250);
  const list = readCategories();
  const current = list.find((c) => c.id === Number(id));
  if (!current) throw new ApiError('Category not found', 404);
  // The slug stays the same so product links and filters keep working.
  const updated = { ...current, name: name.trim(), icon, tint, description: description.trim() };
  write('categories', list.map((c) => (c.id === updated.id ? updated : c)));
  return updated;
}

export async function deleteCategory(id) {
  await delay(250);
  const list = readCategories();
  const category = list.find((c) => c.id === Number(id));
  if (!category) throw new ApiError('Category not found', 404);
  if (readProducts().some((p) => p.category === category.slug)) {
    throw new ApiError('This category still has products. Move or delete them first.', 409);
  }
  write('categories', list.filter((c) => c.id !== category.id));
  return category.id;
}

// ---------------------------------------------------------------------------
// Users / authentication
//
// NOTE: passwords are stored in plain text ONLY because this is a throw-away mock.
// The real back-end will hash them (bcrypt) and hand out signed tokens (JWT).
// ---------------------------------------------------------------------------

const SEED_USERS = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@shopsphere.pk',
    password: 'Admin@123',
    role: 'admin',
    phone: '0300-1000001',
    address: 'ShopSphere HQ, Gulberg III',
    city: 'Lahore',
    createdAt: '2026-09-01',
  },
  {
    id: 2,
    name: 'Ayesha Khan',
    email: 'user@shopsphere.pk',
    password: 'User@1234',
    role: 'customer',
    phone: '0321-1234567',
    address: '12-B, Model Town',
    city: 'Lahore',
    createdAt: '2026-09-10',
  },
  {
    id: 3,
    name: 'Bilal Ahmed',
    email: 'bilal@example.com',
    password: 'User@1234',
    role: 'customer',
    phone: '0333-7654321',
    address: 'Flat 4, Clifton Block 5',
    city: 'Karachi',
    createdAt: '2026-09-14',
  },
  {
    id: 4,
    name: 'Sara Malik',
    email: 'sara@example.com',
    password: 'User@1234',
    role: 'customer',
    phone: '0345-1112233',
    address: 'House 21, F-8/3',
    city: 'Islamabad',
    createdAt: '2026-09-22',
  },
];

const readUsers = () => read('users', SEED_USERS);

// Never send the password back to the UI.
const toPublicUser = ({ password, ...user }) => user;

export async function registerUser({ name, email, password, phone }) {
  await delay(500);
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((u) => u.email === normalizedEmail)) {
    throw new ApiError('An account with this email already exists', 409);
  }
  const user = {
    id: nextId(users),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: 'customer',
    phone: phone.trim(),
    address: '',
    city: '',
    createdAt: today(),
  };
  write('users', [...users, user]);
  return toPublicUser(user);
}

export async function loginUser({ email, password }) {
  await delay(500);
  const user = readUsers().find((u) => u.email === email.trim().toLowerCase());
  if (!user || user.password !== password) throw new ApiError('Incorrect email or password', 401);
  return toPublicUser(user);
}

export async function updateUserProfile(id, { name, phone, address, city, currentPassword, newPassword }) {
  await delay(400);
  const users = readUsers();
  const user = users.find((u) => u.id === Number(id));
  if (!user) throw new ApiError('User not found', 404);

  // Only these fields can be edited by the user (role and email are protected).
  const updated = { ...user };
  if (name !== undefined) updated.name = name.trim();
  if (phone !== undefined) updated.phone = phone.trim();
  if (address !== undefined) updated.address = address.trim();
  if (city !== undefined) updated.city = city;

  if (newPassword) {
    if (user.password !== currentPassword) throw new ApiError('Your current password is incorrect', 400);
    updated.password = newPassword;
  }

  write('users', users.map((u) => (u.id === updated.id ? updated : u)));
  return toPublicUser(updated);
}

export async function getUsers() {
  await delay(250);
  return readUsers().map(toPublicUser);
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
const SEED_NOW = Date.parse('2026-11-06T10:00:00Z');

// Builds a realistic historical order for the demo data.
function buildSeedOrder({ id, userId, lines, status, daysAgo, paymentMethod, promoCode = null }) {
  const user = SEED_USERS.find((u) => u.id === userId);
  const items = lines.map(([productId, quantity]) => {
    const p = seedProducts.find((x) => x.id === productId);
    return { productId, name: p.name, price: p.price, quantity, category: p.category, icon: p.icon, tint: p.tint };
  });
  const totals = calculateTotals(items, promoCode);
  const createdAt = new Date(SEED_NOW - daysAgo * DAY_MS).toISOString();
  const steps = status === 'cancelled' ? ['pending', 'cancelled'] : ORDER_FLOW.slice(0, ORDER_FLOW.indexOf(status) + 1);

  return {
    id,
    userId,
    customer: { name: user.name, email: user.email, phone: user.phone },
    items,
    shipping: { fullName: user.name, phone: user.phone, address: user.address, city: user.city, postalCode: '' },
    paymentMethod,
    cardLast4: paymentMethod === 'card' ? '4242' : null,
    promoCode,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shippingFee: totals.shippingFee,
    total: totals.total,
    status,
    history: steps.map((step, i) => ({ status: step, at: new Date(Date.parse(createdAt) + i * 0.5 * DAY_MS).toISOString() })),
    createdAt,
  };
}

const SEED_ORDERS = [
  buildSeedOrder({ id: 1001, userId: 2, lines: [[1, 1], [3, 1]], status: 'delivered', daysAgo: 32, paymentMethod: 'card' }),
  buildSeedOrder({ id: 1002, userId: 3, lines: [[27, 1], [28, 2]], status: 'delivered', daysAgo: 27, paymentMethod: 'cod' }),
  buildSeedOrder({ id: 1003, userId: 2, lines: [[31, 1], [34, 1]], status: 'delivered', daysAgo: 21, paymentMethod: 'cod' }),
  buildSeedOrder({ id: 1004, userId: 4, lines: [[19, 2], [24, 1]], status: 'shipped', daysAgo: 6, paymentMethod: 'card', promoCode: 'SAVE10' }),
  buildSeedOrder({ id: 1005, userId: 3, lines: [[5, 1]], status: 'processing', daysAgo: 4, paymentMethod: 'card' }),
  buildSeedOrder({ id: 1006, userId: 2, lines: [[2, 1], [30, 1]], status: 'pending', daysAgo: 2, paymentMethod: 'cod' }),
  buildSeedOrder({ id: 1007, userId: 4, lines: [[15, 1]], status: 'cancelled', daysAgo: 12, paymentMethod: 'cod' }),
  buildSeedOrder({ id: 1008, userId: 3, lines: [[8, 1], [10, 1], [9, 1]], status: 'shipped', daysAgo: 3, paymentMethod: 'cod' }),
];

const readOrders = () => read('orders', SEED_ORDERS);

const newestFirst = (orders) => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

function restoreStock(items) {
  const products = readProducts();
  write(
    'products',
    products.map((p) => {
      const line = items.find((item) => item.productId === p.id);
      return line ? { ...p, stock: p.stock + line.quantity } : p;
    })
  );
}

export async function getOrdersByUser(userId) {
  await delay(300);
  return newestFirst(readOrders().filter((o) => o.userId === Number(userId)));
}

export async function getAllOrders() {
  await delay(300);
  return newestFirst(readOrders());
}

export async function createOrder({ userId, items, shipping, paymentMethod, cardLast4 = null, promoCode = null }) {
  await delay(700);
  if (!items?.length) throw new ApiError('Your cart is empty');

  // Re-validate everything against the catalogue: a server never trusts the
  // prices or stock levels that the browser sends.
  const products = readProducts();
  const lines = items.map(({ productId, quantity }) => {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new ApiError('A product in your cart is no longer available', 404);
    if (product.stock < quantity) {
      throw new ApiError(
        product.stock === 0 ? `"${product.name}" is out of stock` : `Only ${product.stock} of "${product.name}" left in stock`,
        409
      );
    }
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      category: product.category,
      icon: product.icon,
      tint: product.tint,
    };
  });

  const user = readUsers().find((u) => u.id === Number(userId));
  if (!user) throw new ApiError('Please log in to place an order', 401);

  const totals = calculateTotals(lines, promoCode);
  const orders = readOrders();
  const createdAt = new Date().toISOString();
  const order = {
    id: nextId(orders),
    userId: user.id,
    customer: { name: user.name, email: user.email, phone: user.phone },
    items: lines,
    shipping,
    paymentMethod,
    cardLast4,
    promoCode,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shippingFee: totals.shippingFee,
    total: totals.total,
    status: 'pending',
    history: [{ status: 'pending', at: createdAt }],
    createdAt,
  };

  write('orders', [order, ...orders]);
  write(
    'products',
    products.map((p) => {
      const line = lines.find((l) => l.productId === p.id);
      return line ? { ...p, stock: p.stock - line.quantity } : p;
    })
  );
  return order;
}

export async function updateOrderStatus(id, status) {
  await delay(300);
  if (!ORDER_STATUSES.includes(status)) throw new ApiError('Invalid order status');
  const orders = readOrders();
  const order = orders.find((o) => o.id === Number(id));
  if (!order) throw new ApiError('Order not found', 404);
  if (order.status === 'cancelled') throw new ApiError('Cancelled orders cannot be changed', 409);
  if (order.status === status) return order;

  const updated = { ...order, status, history: [...order.history, { status, at: new Date().toISOString() }] };
  write('orders', orders.map((o) => (o.id === updated.id ? updated : o)));
  if (status === 'cancelled') restoreStock(order.items);
  return updated;
}

export async function cancelOrder(id, userId) {
  const order = readOrders().find((o) => o.id === Number(id) && o.userId === Number(userId));
  if (!order) throw new ApiError('Order not found', 404);
  if (!canCancel(order.status)) throw new ApiError('This order can no longer be cancelled', 409);
  return updateOrderStatus(id, 'cancelled');
}
