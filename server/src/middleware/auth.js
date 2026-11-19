import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Lets a request through only when it carries a valid session cookie.
 * The user is loaded from the database on every request, so a deleted user or a
 * changed role takes effect immediately. The user is then available as req.user.
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const userId = req.session?.userId;
  if (!userId) throw new ApiError('Please log in to continue', 401);

  const user = await User.findOne({ id: userId });
  if (!user) {
    req.session.destroy(() => {});
    throw new ApiError('Your session has expired. Please log in again', 401);
  }

  req.user = user;
  next();
});

/** Authentication plus the admin role. Use as a route middleware array. */
export const requireAdmin = [
  requireAuth,
  (req, res, next) => {
    if (req.user.role !== 'admin') return next(new ApiError('You do not have permission to do this', 403));
    next();
  },
];
