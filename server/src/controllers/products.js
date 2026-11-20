import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nextId } from '../utils/sequence.js';
import { parseId } from '../utils/parseId.js';

// Only these fields can be set through the API (a whitelist: anything else in the body is ignored).
const EDITABLE = ['name', 'category', 'brand', 'price', 'oldPrice', 'stock', 'featured', 'icon', 'tint', 'description', 'features'];

const pickEditable = (body) =>
  Object.fromEntries(EDITABLE.filter((key) => key in body).map((key) => [key, typeof body[key] === 'string' ? body[key].trim() : body[key]]));

async function assertValidCategory(slug) {
  if (slug !== undefined && !(await Category.exists({ slug }))) {
    throw new ApiError('Choose a valid category', 400, { category: 'Choose a valid category' });
  }
}

function assertOldPrice({ price, oldPrice }) {
  if (oldPrice !== null && oldPrice !== undefined && oldPrice <= price) {
    throw new ApiError('Old price must be higher than the price', 400, { oldPrice: 'Old price must be higher than the price' });
  }
}

// GET /api/products  – newest first
export const listProducts = asyncHandler(async (req, res) => {
  res.json(await Product.find().sort({ createdAt: -1, id: -1 }));
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ id: parseId(req.params.id, 'Product') });
  if (!product) throw new ApiError('Product not found', 404);
  res.json(product);
});

// POST /api/products  (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const data = pickEditable(req.body);
  await assertValidCategory(data.category);
  assertOldPrice(data);

  const product = await Product.create({ ...data, id: await nextId('products') });
  res.status(201).json(product);
});

// PATCH /api/products/:id  (admin) – only the fields that are sent are changed
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ id: parseId(req.params.id, 'Product') });
  if (!product) throw new ApiError('Product not found', 404);

  const changes = pickEditable(req.body);
  await assertValidCategory(changes.category);
  assertOldPrice({ price: changes.price ?? product.price, oldPrice: 'oldPrice' in changes ? changes.oldPrice : product.oldPrice });

  product.set(changes);
  await product.save();
  res.json(product);
});

// DELETE /api/products/:id  (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'Product');
  const product = await Product.findOneAndDelete({ id });
  if (!product) throw new ApiError('Product not found', 404);
  res.json({ id });
});
