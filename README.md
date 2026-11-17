# ShopSphere – E-Commerce Web Application

> CS4032 – Web Programming · Fall 2026 · FAST-NUCES, Lahore

ShopSphere is an e-commerce web application where customers browse, search and buy products online, and an administrator manages the catalogue, stock and orders. Prices are in Pakistani rupees (PKR).

This repository holds **Phase 1: the complete front-end**. There is no server yet: a promise-based mock API (`src/services/mockApi.js`) stores everything in the browser's `localStorage`, so every screen works end to end. In Phase 2 (Node.js / Express / MongoDB) only that service file is replaced by real `fetch` calls.

## Team

| Member                   |
| ------------------------ |
| Muhammad Abdullah Sheikh |
| Subhan Zia               |

## Features

**Customer**
- Register, log in and log out (validated forms, password-strength checklist, session kept across refreshes)
- Browse products on a home page with featured items, deals and category tiles
- Search, filter (category, price range, in-stock), sort and paginate products; filters live in the URL so results can be shared
- Product detail page with image, rating, features tabs, quantity picker and related products
- Shopping cart: change quantity, remove items, promo codes (`SAVE10`, `WELCOME200`, `FREESHIP`), free-delivery progress bar
- Wishlist with "move to cart"
- Checkout with shipping details, cash on delivery or card payment (card number checked with the Luhn algorithm)
- Order history, order detail page with a status timeline (Pending → Processing → Shipped → Delivered), cancel order, print invoice
- Profile page: edit details and change password

**Administrator**
- Dashboard: revenue, orders, customers, low-stock alerts, revenue by category
- Product management: add, edit, delete, search and filter, with live image preview
- Category management with product counts (a category that still has products cannot be deleted)
- Inventory: summary, adjustable low-stock threshold, quick restock (+10) and exact stock updates
- Order management: filter and search, change status (customers see it instantly), view full order details, cancel and return stock

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev       # development server, usually http://localhost:5173
npm run build     # production build in /dist
npm run preview   # serve the production build
```

### Demo accounts

| Role     | Email                 | Password   |
| -------- | --------------------- | ---------- |
| Admin    | admin@shopsphere.pk   | Admin@123  |
| Customer | user@shopsphere.pk    | User@1234  |
| Customer | bilal@example.com     | User@1234  |
| Customer | sara@example.com      | User@1234  |

The login page has "Customer demo" and "Admin demo" buttons that fill in the credentials for you.

> **Tip:** data lives in `localStorage` under keys starting with `shopsphere:`. To reset the demo to its original state, open the browser dev tools → Application → Local Storage and clear them (or run `localStorage.clear()` in the console), then refresh.

## Tech stack

| Technology | Used for |
| --- | --- |
| React 18 + Vite | Component-based UI and fast dev/build tooling |
| React Router 6 | Client-side routing, nested layouts, route guards |
| Redux Toolkit + React-Redux | Global state: products, categories, cart, wishlist, auth, orders, toasts |
| Bootstrap 5 + Bootstrap Icons | Grid, navbar, forms, modals, tables, badges, icons |
| Custom CSS (variables, Flexbox, Grid) | Design tokens and page-specific styling in `src/styles` and next to each component |
| Modern JavaScript (ES6+) | Modules, destructuring, spread, array methods, `async/await`, Promises |

## How the course topics are used

| Course topic | Where to look |
| --- | --- |
| HTML & semantic markup | `index.html`, `<main>`, `<nav>`, `<section>`, `<address>`, labelled form controls, skip link |
| CSS: selectors, box model, Flexbox, responsive design | `src/styles/theme.css`, `global.css`, `responsive.css`, per-component `.css` files |
| Bootstrap | Grid (`row`/`col-*`), navbar, modals, forms, pagination, badges, tables throughout the pages |
| JavaScript fundamentals & ES6 | `src/utils/*`, `src/services/*` |
| Asynchronous JS (Promises, async/await) | `src/services/mockApi.js`, `createAsyncThunk` calls in `src/store/slices` |
| React components, props, hooks | `src/components`, `src/pages`, custom hooks in `src/hooks` (`useForm`, `useDocumentTitle`) |
| Controlled forms & validation | `src/utils/validators.js`, `useForm`, Login / Register / Checkout / Profile / admin forms |
| Routing | `src/App.jsx`, `ProtectedRoute`, `AdminRoute`, URL search params on the Products page |
| Redux | `src/store` – slices, async thunks, selectors, cross-slice `extraReducers` |
| State persistence (storage, sessions) | `src/services/storage.js` – cart, wishlist and login session saved in `localStorage` |
| Security basics | Input validation, React's automatic output escaping, role-based route guards, notes about hashing in the mock API |
| Performance | `React.lazy` + `Suspense` code splitting, `useMemo`, memoised selectors |

## Project structure

```
src/
├── main.jsx · App.jsx
├── styles/        theme.css (design tokens), global.css, responsive.css (small screens + print)
├── data/          categories.js, products.js (seed data), cities.js, icons.js
├── services/      mockApi.js (fake back-end), storage.js (localStorage helpers)
├── utils/         formatters, pricing, validators, productFilters, orderStatus, inventory, errors
├── hooks/         useForm, useDocumentTitle
├── store/         index.js and slices/ (products, categories, cart, wishlist, auth, orders, ui)
├── components/
│   ├── common/    ProductImage, Rating, Spinner, EmptyState, Modal, ConfirmModal, FormField, Pagination, ...
│   ├── layout/    Navbar, Footer, Layout, AdminLayout
│   ├── product/   ProductCard, ProductGrid, FilterSidebar
│   ├── cart/      CartItemRow, OrderSummary
│   ├── orders/    StatusBadge, StatusTimeline
│   ├── admin/     AdminPageHeader, StatCard, ProductFormModal, CategoryFormModal
│   └── routing/   ProtectedRoute, AdminRoute, ScrollToTop
└── pages/         Home, Products, ProductDetail, Cart, Wishlist, Login, Register, Checkout,
                   OrderSuccess, Orders, OrderDetail, Profile, NotFound
    └── admin/     Dashboard, ManageProducts, ManageCategories, Inventory, ManageOrders
```

## How the mock back-end works

- `mockApi.js` exposes functions such as `getProducts`, `loginUser` and `createOrder`. Each returns a Promise that resolves after a short delay, like a real network call, and rejects with an `ApiError` when something is wrong.
- On first run the collections (products, categories, users, orders) are seeded from `src/data` and saved to `localStorage`.
- `createOrder` re-checks prices and stock the way a server would, instead of trusting the browser, and cancelling an order puts the stock back.
- Passwords are stored in plain text **only** because this is a throw-away mock. The real back-end will hash them (bcrypt) and issue tokens (JWT).
- Products use generated placeholder images (a coloured tile and an icon) so the project has no external image dependencies.

## Known limitations (Phase 1)

- Data exists only in the current browser; there is no real server, payment gateway or e-mail.
- Card payment is a simulated form: the card number is validated but never stored (only the last four digits are kept on the order).
- Product images are placeholders; real uploads arrive with the back-end.

## Roadmap

- [x] Phase 1 – Front-end
- [ ] Phase 2 – Back-end (Node.js / Express / MongoDB) replacing `mockApi.js`
