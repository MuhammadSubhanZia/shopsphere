import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { nextId } from '../utils/sequence.js';
import { str } from '../validators/common.js';

// express-session uses callbacks; these wrappers let us use async/await instead.
const regenerate = (req) => new Promise((resolve, reject) => req.session.regenerate((err) => (err ? reject(err) : resolve())));
const save = (req) => new Promise((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));
const destroy = (req) => new Promise((resolve, reject) => req.session.destroy((err) => (err ? reject(err) : resolve())));

/** Starts a fresh session for the user (a new session id prevents session fixation). */
async function signIn(req, user) {
  await regenerate(req);
  req.session.userId = user.id;
  await save(req);
}

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const email = str(req.body.email).toLowerCase();
  if (await User.exists({ email })) throw new ApiError('An account with this email already exists', 409);

  const user = await User.create({
    id: await nextId('users'),
    name: str(req.body.name),
    email,
    phone: str(req.body.phone),
    passwordHash: await hashPassword(req.body.password),
    role: 'customer', // the role can never be chosen by the person registering
  });

  await signIn(req, user);
  res.status(201).json(user);
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: str(req.body.email).toLowerCase() }).select('+passwordHash');

  // The same message for "no such user" and "wrong password" so attackers cannot find out which emails exist.
  if (!user || !(await verifyPassword(req.body.password, user.passwordHash))) {
    throw new ApiError('Incorrect email or password', 401);
  }

  await signIn(req, user);
  res.json(user);
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  await destroy(req);
  res.clearCookie('shopsphere.sid');
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me  – who am I? (the React app calls this on start-up)
export const me = (req, res) => {
  res.json(req.user);
};
