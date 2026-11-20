import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { str } from '../validators/common.js';

// PATCH /api/users/me
// Only name, phone, address and city can be edited (a whitelist), so nobody can promote
// themselves to admin or change their email by adding extra fields to the request.
export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, address, city, currentPassword, newPassword } = req.body;
  const user = await User.findOne({ id: req.user.id }).select('+passwordHash');

  if (name !== undefined) user.name = str(name);
  if (phone !== undefined) user.phone = str(phone);
  if (address !== undefined) user.address = str(address);
  if (city !== undefined) user.city = str(city);

  if (newPassword !== undefined) {
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      throw new ApiError('Your current password is incorrect', 400, { currentPassword: 'Your current password is incorrect' });
    }
    user.passwordHash = await hashPassword(newPassword);
  }

  await user.save();
  res.json(user);
});

// GET /api/users  (admin)
export const listUsers = asyncHandler(async (req, res) => {
  res.json(await User.find().sort({ id: 1 }));
});
