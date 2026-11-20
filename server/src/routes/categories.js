import { Router } from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateCategory } from '../validators/catalog.js';

const router = Router();

router.get('/', listCategories);

router.post('/', requireAdmin, validate(validateCategory), createCategory);
router.patch('/:id', requireAdmin, validate(validateCategory), updateCategory);
router.delete('/:id', requireAdmin, deleteCategory);

export default router;
