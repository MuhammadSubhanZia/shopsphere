import { Router } from 'express';
import { updateMe, listUsers } from '../controllers/users.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateProfileUpdate } from '../validators/users.js';

const router = Router();

router.patch('/me', requireAuth, validate(validateProfileUpdate), updateMe);
router.get('/', requireAdmin, listUsers);

export default router;
