// Fills MongoDB with the demo data. Usage:  npm run seed
// WARNING: it first deletes the existing users, categories, products and orders.
import { pathToFileURL } from 'node:url';
import { env } from '../config/env.js';
import { connectDb, disconnectDb } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Counter } from '../models/Counter.js';
import { setSequence } from '../utils/sequence.js';
import { hashPassword } from '../utils/password.js';
import { categories } from './categories.js';
import { products } from './products.js';
import { seedUsers } from './users.js';
import { seedOrders } from './orders.js';

/** Resets the database to the demo state. Assumes the connection is already open. */
export async function runSeed() {
  await Promise.all([User, Category, Product, Order, Counter].map((model) => model.deleteMany({})));

  const users = await Promise.all(
    seedUsers.map(async ({ password, ...user }) => ({ ...user, passwordHash: await hashPassword(password) }))
  );
  await User.insertMany(users);
  await Category.insertMany(categories);
  await Product.insertMany(products.map((p) => ({ ...p, createdAt: new Date(p.createdAt) })));
  await Order.insertMany(seedOrders);

  // The next new record must get an id higher than the seeded ones.
  const maxId = (list) => Math.max(...list.map((item) => item.id));
  await setSequence('users', maxId(seedUsers));
  await setSequence('categories', maxId(categories));
  await setSequence('products', maxId(products));
  await setSequence('orders', maxId(seedOrders));

  return { users: users.length, categories: categories.length, products: products.length, orders: seedOrders.length };
}

// Run directly (node src/seed/seed.js), not when imported by the tests.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (env.isProd && !process.argv.includes('--force')) {
    console.error('Refusing to wipe a production database. Add --force if you really mean it.');
    process.exit(1);
  }

  connectDb()
    .then(runSeed)
    .then((counts) => {
      console.log('Database seeded:', counts);
      console.log('Admin login:    admin@shopsphere.pk / Admin@123');
      console.log('Customer login: user@shopsphere.pk / User@1234');
    })
    .catch((error) => {
      console.error('Seeding failed:', error.message);
      process.exitCode = 1;
    })
    .finally(() => disconnectDb());
}
