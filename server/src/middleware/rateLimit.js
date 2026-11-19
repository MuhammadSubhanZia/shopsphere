import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/** Slows down password guessing: at most 20 login/register attempts per IP every 15 minutes. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isTest ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});
