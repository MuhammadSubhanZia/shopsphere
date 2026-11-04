# ShopSphere – E-Commerce Web Application

> CS4032 – Web Programming · Fall 2026 · FAST-NUCES, Lahore

ShopSphere is a full-stack e-commerce web application that lets customers browse, search and purchase products online. Customers manage their accounts, shopping carts, wishlists and orders, while an administrator manages products, categories, inventory and customer orders.

This repository currently contains **Phase 1: the front-end**.

## Team

| Member                  |
| ----------------------- |
| Muhammad Abdullah Sheikh |
| Subhan Zia              |

## Planned Features

**Customer**
- User registration and login
- Browse, search, filter and sort products
- Product detail pages
- Add / remove products from the shopping cart and wishlist
- Checkout and order placement
- View and track order status

**Administrator**
- Dashboard with store statistics
- Manage products and categories
- Inventory management with low-stock alerts
- Manage customer orders and update their status

## Tech Stack

- **React 18** with **Vite** – component-based UI
- **React Router** – client-side routing
- **Redux Toolkit** – global state (cart, wishlist, auth, orders)
- **Bootstrap 5** + custom CSS (Flexbox, CSS variables) – responsive layout
- **Modern JavaScript (ES6+)** – modules, destructuring, async/await, promises
- A mock API layer (promise based, persisted in `localStorage`) standing in for the back-end until Phase 2

## Project Status

- [x] Repository initialised
- [ ] Phase 1 – Front-end (in progress)
- [ ] Phase 2 – Back-end (Node.js / Express / MongoDB)
