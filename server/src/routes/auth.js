import { Router } from 'express';
import { register, login, logout, me } from '../controllers/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../validators/auth.js';

const router = Router();

router.post('/register', authLimiter, validate(validateRegister), register);
router.post('/login', authLimiter, validate(validateLogin), login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
