# ShopSphere – E-Commerce Web Application

> CS4032 – Web Programming · Fall 2026 · FAST-NUCES, Lahore

ShopSphere is a full-stack e-commerce web application where customers browse, search and buy products online, and an administrator manages the catalogue, stock and orders. Prices are in Pakistani rupees (PKR).

It is a MERN-style project:

| Part | Folder | Stack |
| --- | --- | --- |
| Front-end | [`client/`](client) | React 18, Vite, React Router, Redux Toolkit, Bootstrap 5 |
| Back-end | [`server/`](server) | Node.js, Express, MongoDB with Mongoose, session cookies, bcrypt |

## Team

| Member                   |
| ------------------------ |
| Muhammad Abdullah Sheikh |
| Subhan Zia               |

## Features

**Customer**
- Register, log in and log out (validated forms, password-strength checklist, secure session cookie)
- Browse products on a home page with featured items, deals and category tiles
- Search, filter (category, price range, in-stock), sort and paginate products; filters live in the URL so results can be shared
- Product detail page with rating, features tabs, quantity picker and related products
- Shopping cart: change quantity, remove items, promo codes (`SAVE10`, `WELCOME200`, `FREESHIP`), free-delivery progress bar
- Wishlist with "move to cart"
- Checkout with shipping details, cash on delivery or card payment (card number checked with the Luhn algorithm; only the last 4 digits are kept)
- Order history, order detail page with a status timeline (Pending → Processing → Shipped → Delivered), cancel order, print invoice
- Profile page: edit details and change password

**Administrator**
- Dashboard: revenue, orders, low-stock alerts, revenue by category
- Product management: add, edit, delete, search and filter, with live image preview
- Category management with product counts (a category that still has products cannot be deleted)
- Inventory: summary, adjustable low-stock threshold, quick restock and exact stock updates
- Order management: filter and search, change status (customers see it instantly), view full order details, cancel and return stock

## Getting started

Requirements: **Node.js 18+** and **MongoDB** (MongoDB Community Server installed locally, or a free MongoDB Atlas cluster).

```bash
# 1. Install the dependencies of the root, client and server
npm install
npm run install:all

# 2. Configure the server
cd server
cp .env.example .env        # Windows PowerShell: copy .env.example .env
# open server/.env and check MONGODB_URI (local MongoDB works with the default)
cd ..

# 3. Load the demo data into MongoDB
npm run seed

# 4. Start the API (port 5000) and the React app (port 5173) together
npm run dev
```

Open <http://localhost:5173>. The API health check is at <http://localhost:5000/api/health>.

| Command (run in the project root) | What it does |
| --- | --- |
| `npm run dev` | Starts the server and the client together |
| `npm run seed` | Resets MongoDB to the demo data (**deletes** users, products, categories and orders) |
| `npm test` | Runs the API tests (uses a separate `shopsphere_test` database) |
| `npm run build` | Production build of the React app in `client/dist` |

You can also run each part on its own: `npm run dev` inside `client/` or `server/`.

### Demo accounts

| Role     | Email                 | Password   |
| -------- | --------------------- | ---------- |
| Admin    | admin@shopsphere.pk   | Admin@123  |
| Customer | user@shopsphere.pk    | User@1234  |
| Customer | bilal@example.com     | User@1234  |
| Customer | sara@example.com      | User@1234  |

The login page has "Customer demo" and "Admin demo" buttons that fill in the credentials for you.

## How it fits together

```
Browser (React app on :5173)
   │  fetch("/api/...", credentials)         Vite dev server forwards /api
   ▼
Express API (:5000)  ──  middleware: helmet, cors, compression, morgan, json, sanitize, session
   │  routes → controllers → services
   ▼
MongoDB (users, products, categories, orders, sessions)
```

- The browser never sees a password hash or the session contents: login sets an `httpOnly` cookie holding only a random session id.
- Checkout sends only product ids and quantities. The server looks up prices and stock, applies the promo code and calculates the total itself.
- Stock is reserved with atomic updates, so the last item cannot be sold twice, and it is returned when an order is cancelled.
- The cart and wishlist are kept in the browser's `localStorage`.

More detail, the full API table and the security measures are in [`server/README.md`](server/README.md).

## How the course topics are used

| Course topic | Where to look |
| --- | --- |
| HTML & semantic markup | `client/index.html`, `<main>`, `<nav>`, `<section>`, `<address>`, labelled form controls, skip link |
| CSS: selectors, box model, Flexbox, responsive design | `client/src/styles`, per-component `.css` files |
| Bootstrap | Grid, navbar, modals, forms, pagination, badges and tables throughout the pages |
| JavaScript fundamentals, ES6 | `client/src/utils`, `server/src/utils` (modules, destructuring, spread, array methods) |
| Asynchronous JS (Promises, async/await) | `client/src/services/api.js`, `createAsyncThunk` in `client/src/store/slices`, every controller in `server/src/controllers` |
| React components, props, hooks | `client/src/components`, `client/src/pages`, custom hooks in `client/src/hooks` |
| Redux | `client/src/store` – slices, async thunks, selectors |
| Web servers and server-side programming (Node.js) | `server/src/index.js`, `server/src/app.js` |
| RESTful routing | `server/src/routes` – resources, HTTP verbs and status codes |
| Express and middleware | `server/src/middleware` and the middleware stack in `server/src/app.js` |
| State management: cookies and sessions | `express-session` + MongoDB session store in `server/src/app.js`, `server/src/controllers/auth.js` |
| NoSQL databases (MongoDB), CRUD | Mongoose models in `server/src/models`, CRUD in `server/src/controllers` |
| Web services: RESTful services | The JSON API documented in `server/README.md`, consumed by `client/src/services/api.js` |
| Security: XSS, cross-domain issues, passwords | httpOnly cookies, `helmet`, `cors`, input validation and sanitising, bcrypt, rate limiting, role checks |
| Performance | `React.lazy` + `Suspense` code splitting, `useMemo`, response compression, atomic database updates |

## Project structure

```
shopsphere/
├── client/                React application
│   ├── src/
│   │   ├── components/    common, layout, product, cart, orders, admin, routing
│   │   ├── pages/         customer pages and pages/admin
│   │   ├── store/         Redux Toolkit slices
│   │   ├── services/      api.js (fetch client), storage.js (localStorage helpers)
│   │   ├── utils/ hooks/ data/ styles/
│   │   └── main.jsx · App.jsx
│   └── vite.config.js     dev server and /api proxy
├── server/                Express API
│   ├── src/
│   │   ├── config/ models/ routes/ controllers/ services/
│   │   ├── middleware/ validators/ utils/ seed/
│   │   └── index.js · app.js
│   └── tests/             API integration tests
└── package.json           root scripts (dev, seed, test, build)
```

## Known limitations

- Card payment is simulated: the card number is validated in the browser but never sent or stored (only the last four digits are kept on the order). There is no real payment gateway or e-mail.
- Product images are generated placeholders (a coloured tile and an icon); image upload is not implemented.
- Cart and wishlist live in the browser, so they do not follow a user to another device.

## Roadmap

- [x] Phase 1 – Front-end
- [x] Phase 2 – Back-end (Node.js / Express / MongoDB) connected to the front-end
- [ ] Deployment (hosted API, MongoDB Atlas and the built React app over HTTPS)
