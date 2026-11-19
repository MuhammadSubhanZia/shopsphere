import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env.js';
import { sanitize } from './middleware/sanitize.js';
import { notFound, errorHandler } from './middleware/error.js';

/** Builds the Express application. Kept separate from index.js so tests can import it. */
export function createApp() {
  const app = express();

  if (env.isProd) app.set('trust proxy', 1); // running behind a hosting proxy (HTTPS)

  // ---------- Middleware (runs top to bottom for every request) ----------
  app.use(helmet()); // sets secure HTTP headers
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(compression()); // gzip responses
  if (!env.isTest) app.use(morgan(env.isProd ? 'combined' : 'dev')); // request logging
  app.use(express.json({ limit: '50kb' })); // parse JSON bodies
  app.use(sanitize); // strip MongoDB operators from user input

  // ---------- Routes ----------
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: Math.round(process.uptime()), time: new Date().toISOString() });
  });

  // ---------- Errors ----------
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
