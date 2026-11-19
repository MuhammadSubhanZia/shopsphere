import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // work factor: higher is slower to brute-force (and slower to log in)

/** Turns a plain password into a salted bcrypt hash that is safe to store. */
export const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

/** Compares a login attempt with a stored hash. */
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);
