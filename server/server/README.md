# ShopSphere – Server (REST API)

Node.js + Express + MongoDB (Mongoose) back-end for the ShopSphere store. It stores users, products, categories and orders, signs people in with session cookies, and re-checks every order on the server.

## Requirements

- Node.js 18 or newer
- A MongoDB database: either **MongoDB Community Server** installed locally, or a free **MongoDB Atlas** cluster

## Setup

```bash
cd server
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
```

Open `.env` and set:

| Variable | Meaning |
| --- | --- |
| `PORT` | Port of the API (default `5000`) |
| `MONGODB_URI` | Connection string, e.g. `mongodb://127.0.0.1:27017/shopsphere` or your Atlas string |
| `CLIENT_ORIGIN` | Address of the React app (default `http://localhost:5173`), used for CORS |
| `SESSION_SECRET` | Long random text that signs the session cookie |

Load the demo data and start the API:

```bash
npm run seed     # users, categories, 36 products, 8 orders (wipes those collections first)
npm run dev      # auto-restarts on file changes; use "npm start" for a plain run
```

Check it: open <http://localhost:5000/api/health>. You should see `{"status":"ok", ...}`.

Demo accounts (created by the seed script): `admin@shopsphere.pk / Admin@123` and `user@shopsphere.pk / User@1234`.

### Tests

```bash
npm test
```

The tests use a separate database called `shopsphere_test` (override with `MONGODB_URI_TEST`; the name must end in `_test`), so your development data is never touched. They cover authentication, permissions, validation, server-side order pricing, stock handling, cancellation and a simultaneous-purchase (race) check.

## API reference

All responses are JSON. Errors look like `{ "message": "Human readable text", "errors": { "field": "text" } }` (`errors` only for validation problems). Protected routes need the session cookie that login sets.

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | public | Server status |
| POST | `/api/auth/register` | public | Create a customer account and sign in |
| POST | `/api/auth/login` | public | Sign in |
| POST | `/api/auth/logout` | public | Sign out (destroys the session) |
| GET | `/api/auth/me` | logged in | Current user |
| GET | `/api/products` | public | List products (newest first) |
| GET | `/api/products/:id` | public | One product |
| POST | `/api/products` | admin | Create a product |
| PATCH | `/api/products/:id` | admin | Update some fields (e.g. only `stock`) |
| DELETE | `/api/products/:id` | admin | Delete a product |
| GET | `/api/categories` | public | List categories |
| POST | `/api/categories` | admin | Create a category (slug generated from the name) |
| PATCH | `/api/categories/:id` | admin | Rename / change icon, colour, description |
| DELETE | `/api/categories/:id` | admin | Delete (blocked while it still has products) |
| GET | `/api/orders/mine` | logged in | My orders, newest first |
| GET | `/api/orders` | admin | Every order |
| POST | `/api/orders` | logged in | Place an order (body: `items`, `shipping`, `paymentMethod`, `cardLast4`, `promoCode`) |
| PATCH | `/api/orders/:id/status` | admin | Change the status (body: `{ "status": "shipped" }`) |
| POST | `/api/orders/:id/cancel` | owner | Cancel my order (until it is shipped) |
| PATCH | `/api/users/me` | logged in | Edit profile or change password |
| GET | `/api/users` | admin | List users |

Status codes used: `200` OK, `201` created, `400` invalid data, `401` not logged in, `403` not allowed, `404` not found, `409` conflict (duplicate, out of stock, wrong order state), `429` too many login attempts.

## How it works

```
src/
├── index.js          starts the server (connects to MongoDB, then listens)
├── app.js            builds the Express app: middleware, sessions, routes, error handling
├── config/           env.js (settings), db.js (Mongoose connection)
├── models/           User, Category, Product, Order, Counter (Mongoose schemas)
├── routes/           URL -> controller mapping and which middleware protects each route
├── controllers/      one function per endpoint (thin: read request, call logic, send JSON)
├── services/         orders.js - business logic for placing and changing orders
├── middleware/       auth (requireAuth/requireAdmin), validate, sanitize, rateLimit, error
├── validators/       checks for incoming data
├── utils/            ApiError, asyncHandler, password hashing, id sequences, pricing rules
└── seed/             demo data and the seed script
```

A request travels through the middleware stack top to bottom (`helmet` → `cors` → `compression` → `morgan` → JSON body parser → `sanitize` → sessions), then to the matching route, which may run route-level middleware (`requireAdmin`, `validate(...)`) before the controller. Any error is passed to the final `errorHandler`, which turns it into JSON.

### Design decisions

- **Sessions with cookies** (not tokens in `localStorage`): the browser keeps only a random session id in an `httpOnly` cookie, so page scripts, and therefore an XSS attack, cannot read it. Sessions are stored in MongoDB, so they survive a server restart.
- **Passwords** are hashed with bcrypt (`bcryptjs`) and never returned by the API.
- **The server never trusts the browser.** Checkout sends only product ids and quantities; prices, stock, promo discount, delivery fee and total are calculated on the server. Roles are checked on every protected route, and users can edit only a whitelist of fields.
- **Stock cannot be oversold.** Stock is reserved with an atomic "decrease only if enough is left" update, and returned if a later step fails or an order is cancelled. (Multi-document transactions need a MongoDB replica set, which a plain local install does not have.)
- **Readable ids.** Each record keeps a numeric `id` (1, 2, 3 ... generated by a counter collection) next to MongoDB's `_id`, because the React app and order references such as `SS-1001` use them.
- **Cart and wishlist** stay in the browser (`localStorage`); the server validates the cart contents at checkout.

### Security measures

| Risk | Measure |
| --- | --- |
| Stolen passwords | bcrypt hashing, strong-password rule, generic "incorrect email or password" message |
| Brute-force login | `express-rate-limit` on register and login |
| NoSQL injection | `sanitize` middleware removes keys starting with `$` or containing `.`; validators insist on strings |
| XSS | `httpOnly` cookie, `helmet` headers, JSON-only API (React escapes output) |
| CSRF | `SameSite=Lax` cookie and a JSON-only API |
| Cross-origin access | `cors` allows only `CLIENT_ORIGIN` |
| Privilege escalation | role is never accepted from the client; `requireAdmin` on every admin route |
| Information leaks | stack traces are hidden in production; password hashes are never selected |
| Transport | cookie is marked `secure` in production (use HTTPS when you deploy) |

## Deploying later

Set `NODE_ENV=production`, a real `SESSION_SECRET` and your Atlas `MONGODB_URI`, serve the API over HTTPS, and set `CLIENT_ORIGIN` to the address of the deployed React app.
