import { Router } from 'express';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/products.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateProductCreate, validateProductUpdate } from '../validators/catalog.js';

const router = Router();

// Anyone can browse the catalogue...
router.get('/', listProducts);
router.get('/:id', getProduct);

// ...only administrators can change it.
router.post('/', requireAdmin, validate(validateProductCreate), createProduct);
router.patch('/:id', requireAdmin, validate(validateProductUpdate), updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;
