import { Router } from 'express';
import { listMyOrders, listAllOrders, createOrder, updateOrderStatus, cancelOrder } from '../controllers/orders.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateOrder, validateStatus } from '../validators/orders.js';

const router = Router();

// "/mine" must be declared before any "/:id" route, otherwise "mine" would be read as an id.
router.get('/mine', requireAuth, listMyOrders);
router.get('/', requireAdmin, listAllOrders);
router.post('/', requireAuth, validate(validateOrder), createOrder);
router.patch('/:id/status', requireAdmin, validate(validateStatus), updateOrderStatus);
router.post('/:id/cancel', requireAuth, cancelOrder);

export default router;
