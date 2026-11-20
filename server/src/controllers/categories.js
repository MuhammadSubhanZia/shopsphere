import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nextId } from '../utils/sequence.js';
import { parseId } from '../utils/parseId.js';
import { slugify } from '../utils/slugify.js';

// GET /api/categories
export const listCategories = asyncHandler(async (req, res) => {
  res.json(await Category.find().sort({ id: 1 }));
});

// POST /api/categories  (admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, icon, tint, description } = req.body;
  const slug = slugify(name);
  if (!slug || (await Category.exists({ slug }))) {
    throw new ApiError('A category with this name already exists', 409);
  }

  const category = await Category.create({
    id: await nextId('categories'),
    name: name.trim(),
    slug,
    ...(icon !== undefined && { icon }),
    ...(tint !== undefined && { tint }),
    description: typeof description === 'string' ? description.trim() : '',
  });
  res.status(201).json(category);
});

// PATCH /api/categories/:id  (admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ id: parseId(req.params.id, 'Category') });
  if (!category) throw new ApiError('Category not found', 404);

  const { name, icon, tint, description } = req.body;
  // The slug never changes, so product links and filters keep working after a rename.
  category.set({
    name: name.trim(),
    ...(icon !== undefined && { icon }),
    ...(tint !== undefined && { tint }),
    ...(description !== undefined && { description: description.trim() }),
  });
  await category.save();
  res.json(category);
});

// DELETE /api/categories/:id  (admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ id: parseId(req.params.id, 'Category') });
  if (!category) throw new ApiError('Category not found', 404);

  if (await Product.exists({ category: category.slug })) {
    throw new ApiError('This category still has products. Move or delete them first.', 409);
  }

  await category.deleteOne();
  res.json({ id: category.id });
});
