import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { env } from './config/env.js';
import { sanitize } from './middleware/sanitize.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Builds the Express application. Kept separate from index.js so tests can import it.
 * `sessionStore` is optional: tests can pass an in-memory store.
 */
export function createApp({ sessionStore } = {}) {
  const app = express();

  if (env.isProd) app.set('trust proxy', 1); // running behind a hosting proxy (HTTPS)

  // ---------- Middleware (runs top to bottom for every request) ----------
  app.use(helmet()); // sets secure HTTP headers
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(compression()); // gzip responses
  if (!env.isTest) app.use(morgan(env.isProd ? 'combined' : 'dev')); // request logging
  app.use(express.json({ limit: '50kb' })); // parse JSON bodies
  app.use(sanitize); // strip MongoDB operators from user input

  // Sessions: the browser keeps only a random id in an httpOnly cookie, so JavaScript
  // (and therefore an XSS attack) cannot read it. The data itself lives in MongoDB.
  app.use(
    session({
      name: 'shopsphere.sid',
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store:
        sessionStore ??
        MongoStore.create({
          mongoUrl: env.mongoUri,
          collectionName: 'sessions',
          ttl: WEEK_MS / 1000,
          autoRemove: 'interval', // delete expired sessions every 10 minutes (works on every MongoDB host)
          autoRemoveInterval: 10,
        }),
      cookie: {
        httpOnly: true,
        sameSite: 'lax', // not sent on cross-site POSTs: basic CSRF protection
        secure: env.isProd, // HTTPS only in production
        maxAge: WEEK_MS,
      },
    })
  );

  // ---------- Routes ----------
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: Math.round(process.uptime()), time: new Date().toISOString() });
  });
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);

  // ---------- Errors ----------
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
