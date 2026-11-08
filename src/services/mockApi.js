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
