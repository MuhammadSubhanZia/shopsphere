// API integration tests. Run with:  npm test
// They need a running MongoDB. They use their own database (shopsphere_test),
// so your development data is never touched.
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import session from 'express-session';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/shopsphere_test';
if (!process.env.MONGODB_URI.split('?')[0].endsWith('_test')) {
  throw new Error('Refusing to run tests: the test database name must end with "_test" (the tests wipe it).');
}

// Loaded after the environment is set (static imports would run first).
const { createApp } = await import('../src/app.js');
const { connectDb, disconnectDb } = await import('../src/config/db.js');
const { runSeed } = await import('../src/seed/seed.js');

const app = createApp({ sessionStore: new session.MemoryStore() });

const CUSTOMER = { email: 'user@shopsphere.pk', password: 'User@1234' };
const ADMIN = { email: 'admin@shopsphere.pk', password: 'Admin@123' };

const SHIPPING = { fullName: 'Ayesha Khan', phone: '0321-1234567', address: '12-B Model Town', city: 'Lahore', postalCode: '54000', notes: '' };
const orderBody = (items, extra = {}) => ({ items, shipping: SHIPPING, paymentMethod: 'cod', ...extra });

/** A supertest agent that keeps the session cookie, like a browser. */
async function loginAs(credentials) {
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send(credentials).expect(200);
  return agent;
}

const stockOf = async (id) => (await request(app).get(`/api/products/${id}`)).body.stock;

before(async () => {
  await connectDb();
});

// Every test group starts from the same demo data.
const reset = () => runSeed();

after(async () => {
  await disconnectDb();
});

describe('health and errors', () => {
  before(reset);

  test('GET /api/health', async () => {
    const res = await request(app).get('/api/health').expect(200);
    assert.equal(res.body.status, 'ok');
  });

  test('unknown routes return a JSON 404', async () => {
    const res = await request(app).get('/api/nothing-here').expect(404);
    assert.match(res.body.message, /not found/i);
  });

  test('invalid JSON returns 400', async () => {
    await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad').expect(400);
  });
});

describe('authentication', () => {
  before(reset);

  test('register creates a customer, hashes the password and signs in', async () => {
    const agent = request.agent(app);
    const res = await agent
      .post('/api/auth/register')
      .send({ name: 'New Shopper', email: 'New@Example.com', phone: '0300-1234567', password: 'Secret123' })
      .expect(201);

    assert.equal(res.body.email, 'new@example.com');
    assert.equal(res.body.role, 'customer');
    assert.equal(res.body.passwordHash, undefined);
    assert.equal(res.body.password, undefined);
    await agent.get('/api/auth/me').expect(200);
  });

  test('register rejects weak passwords and duplicate emails', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Weak One', email: 'weak@example.com', phone: '0300-1234567', password: 'abc' }).expect(400);
    await request(app).post('/api/auth/register').send({ name: 'Dup One', email: CUSTOMER.email, phone: '0300-1234567', password: 'Secret123' }).expect(409);
  });

  test('nobody can register as admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Sneaky User', email: 'sneaky@example.com', phone: '0300-1234567', password: 'Secret123', role: 'admin' })
      .expect(201);
    assert.equal(res.body.role, 'customer');
  });

  test('login works, wrong password and unknown email give the same 401', async () => {
    await request(app).post('/api/auth/login').send(CUSTOMER).expect(200);
    const wrong = await request(app).post('/api/auth/login').send({ ...CUSTOMER, password: 'Wrong@1234' }).expect(401);
    const unknown = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'Wrong@1234' }).expect(401);
    assert.equal(wrong.body.message, unknown.body.message);
  });

  test('NoSQL operator injection in the login body is rejected', async () => {
    await request(app).post('/api/auth/login').send({ email: { $gt: '' }, password: { $gt: '' } }).expect(400);
  });

  test('/me needs a session and logout ends it', async () => {
    await request(app).get('/api/auth/me').expect(401);
    const agent = await loginAs(CUSTOMER);
    await agent.get('/api/auth/me').expect(200);
    await agent.post('/api/auth/logout').expect(200);
    await agent.get('/api/auth/me').expect(401);
  });
});

describe('products and categories', () => {
  before(reset);

  const newProduct = {
    name: 'Test Gadget',
    category: 'electronics',
    brand: 'TestCo',
    price: 1999,
    oldPrice: null,
    stock: 5,
    description: 'A test product with a long enough description.',
    features: ['One', 'Two'],
  };

  test('anyone can list and read products', async () => {
    const list = await request(app).get('/api/products').expect(200);
    assert.equal(list.body.length, 36);
    assert.equal(typeof list.body[0].id, 'number');
    assert.equal(list.body[0]._id, undefined);
    await request(app).get('/api/products/1').expect(200);
    await request(app).get('/api/products/99999').expect(404);
    await request(app).get('/api/products/abc').expect(404);
  });

  test('only admins can create, edit and delete products', async () => {
    await request(app).post('/api/products').send(newProduct).expect(401);
    const customer = await loginAs(CUSTOMER);
    await customer.post('/api/products').send(newProduct).expect(403);

    const admin = await loginAs(ADMIN);
    const created = await admin.post('/api/products').send(newProduct).expect(201);
    assert.equal(created.body.id, 37);

    const patched = await admin.patch('/api/products/37').send({ stock: 42 }).expect(200);
    assert.equal(patched.body.stock, 42);
    assert.equal(patched.body.name, 'Test Gadget'); // other fields untouched

    await admin.delete('/api/products/37').expect(200);
    await request(app).get('/api/products/37').expect(404);
  });

  test('product data is validated', async () => {
    const admin = await loginAs(ADMIN);
    await admin.post('/api/products').send({ ...newProduct, name: 'ab' }).expect(400);
    await admin.post('/api/products').send({ ...newProduct, price: -5 }).expect(400);
    await admin.post('/api/products').send({ ...newProduct, category: 'does-not-exist' }).expect(400);
    await admin.post('/api/products').send({ ...newProduct, oldPrice: 100 }).expect(400);
    await admin.patch('/api/products/1').send({ stock: 1.5 }).expect(400);
  });

  test('a category with products cannot be deleted, an empty one can', async () => {
    const admin = await loginAs(ADMIN);
    await admin.delete('/api/categories/1').expect(409);

    const created = await admin.post('/api/categories').send({ name: 'Pet Care', description: 'Pets' }).expect(201);
    assert.equal(created.body.slug, 'pet-care');
    await admin.post('/api/categories').send({ name: 'Pet Care' }).expect(409);
    await admin.delete(`/api/categories/${created.body.id}`).expect(200);
  });
});

describe('orders', () => {
  before(reset);

  test('a customer can only see their own orders; admins see all', async () => {
    const customer = await loginAs(CUSTOMER);
    const mine = await customer.get('/api/orders/mine').expect(200);
    assert.ok(mine.body.length > 0);
    assert.ok(mine.body.every((order) => order.userId === 2));

    await customer.get('/api/orders').expect(403);
    const all = await (await loginAs(ADMIN)).get('/api/orders').expect(200);
    assert.ok(all.body.length > mine.body.length);
  });

  test('placing an order recalculates prices on the server and reduces stock', async () => {
    const customer = await loginAs(CUSTOMER);
    const before = await stockOf(4); // Portable Bluetooth Speaker, Rs. 5,499

    // The browser "lies" about the price and total: the server must ignore both.
    const res = await customer
      .post('/api/orders')
      .send(orderBody([{ productId: 4, quantity: 2, price: 1 }], { promoCode: 'save10', total: 1 }))
      .expect(201);

    assert.equal(res.body.subtotal, 10998);
    assert.equal(res.body.discount, 1100);
    assert.equal(res.body.shippingFee, 0);
    assert.equal(res.body.total, 9898);
    assert.equal(res.body.status, 'pending');
    assert.equal(res.body.promoCode, 'SAVE10');
    assert.equal(await stockOf(4), before - 2);
  });

  test('orders are rejected when stock is missing, and nothing is reserved', async () => {
    const customer = await loginAs(CUSTOMER);
    const before = await stockOf(4);

    await customer.post('/api/orders').send(orderBody([{ productId: 4, quantity: 50 }])).expect(409);
    // Product 18 has no stock: the whole order fails and product 4 is not touched.
    await customer.post('/api/orders').send(orderBody([{ productId: 4, quantity: 1 }, { productId: 18, quantity: 1 }])).expect(409);
    assert.equal(await stockOf(4), before);
  });

  test('invalid orders are rejected', async () => {
    const customer = await loginAs(CUSTOMER);
    await customer.post('/api/orders').send(orderBody([])).expect(400);
    await customer.post('/api/orders').send({ ...orderBody([{ productId: 4, quantity: 1 }]), paymentMethod: 'bitcoin' }).expect(400);
    await customer.post('/api/orders').send(orderBody([{ productId: 4, quantity: 1 }], { promoCode: 'FAKECODE' })).expect(400);
    await request(app).post('/api/orders').send(orderBody([{ productId: 4, quantity: 1 }])).expect(401);
  });

  test('simultaneous orders for the last units cannot oversell', async () => {
    const admin = await loginAs(ADMIN);
    await admin.patch('/api/products/2').send({ stock: 3 }).expect(200);

    const customer = await loginAs(CUSTOMER);
    const results = await Promise.all(Array.from({ length: 8 }, () => customer.post('/api/orders').send(orderBody([{ productId: 2, quantity: 1 }]))));

    assert.equal(results.filter((r) => r.status === 201).length, 3);
    assert.equal(results.filter((r) => r.status === 409).length, 5);
    assert.equal(await stockOf(2), 0);
  });

  test('cancelling returns the stock; only the owner can cancel; shipped orders cannot be cancelled', async () => {
    const customer = await loginAs(CUSTOMER);
    const before = await stockOf(5);
    const order = (await customer.post('/api/orders').send(orderBody([{ productId: 5, quantity: 1 }])).expect(201)).body;
    assert.equal(await stockOf(5), before - 1);

    const other = await loginAs({ email: 'bilal@example.com', password: 'User@1234' });
    await other.post(`/api/orders/${order.id}/cancel`).expect(404); // not their order

    const cancelled = await customer.post(`/api/orders/${order.id}/cancel`).expect(200);
    assert.equal(cancelled.body.status, 'cancelled');
    assert.equal(cancelled.body.history.length, 2);
    assert.equal(await stockOf(5), before);
    await customer.post(`/api/orders/${order.id}/cancel`).expect(409);

    // Seed order 1004 belongs to another customer and is already shipped.
    const sara = await loginAs({ email: 'sara@example.com', password: 'User@1234' });
    await sara.post('/api/orders/1004/cancel').expect(409);
  });

  test('admins can change the status; customers cannot; cancelled orders are final', async () => {
    const admin = await loginAs(ADMIN);
    const customer = await loginAs(CUSTOMER);

    const res = await admin.patch('/api/orders/1006/status').send({ status: 'processing' }).expect(200);
    assert.equal(res.body.status, 'processing');
    assert.equal(res.body.history.at(-1).status, 'processing');

    await customer.patch('/api/orders/1006/status').send({ status: 'shipped' }).expect(403);
    await admin.patch('/api/orders/1006/status').send({ status: 'bogus' }).expect(400);
    await admin.patch('/api/orders/1007/status').send({ status: 'shipped' }).expect(409); // seed order 1007 is cancelled
  });
});

describe('profile', () => {
  before(reset);

  test('users can edit only whitelisted fields', async () => {
    const customer = await loginAs(CUSTOMER);
    const res = await customer.patch('/api/users/me').send({ city: 'Karachi', role: 'admin', email: 'hacker@example.com' }).expect(200);
    assert.equal(res.body.city, 'Karachi');
    assert.equal(res.body.role, 'customer');
    assert.equal(res.body.email, CUSTOMER.email);
  });

  test('only admins can list users', async () => {
    const customer = await loginAs(CUSTOMER);
    await customer.get('/api/users').expect(403);
    const admin = await loginAs(ADMIN);
    const res = await admin.get('/api/users').expect(200);
    assert.ok(res.body.every((user) => user.passwordHash === undefined));
  });

  // Last, because it changes the customer's password.
  test('changing the password needs the current one', async () => {
    const customer = await loginAs(CUSTOMER);
    await customer.patch('/api/users/me').send({ currentPassword: 'Wrong@1234', newPassword: 'NewPass123' }).expect(400);
    await customer.patch('/api/users/me').send({ currentPassword: CUSTOMER.password, newPassword: 'NewPass123' }).expect(200);

    await request(app).post('/api/auth/login').send(CUSTOMER).expect(401);
    await request(app).post('/api/auth/login').send({ email: CUSTOMER.email, password: 'NewPass123' }).expect(200);
  });
});
