import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';

/** Every setting the server reads from the environment lives here, in one place. */
export const env = {
  nodeEnv,
  isProd: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopsphere',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  sessionSecret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
};

if (env.isProd && env.sessionSecret === 'dev-only-secret-change-me') {
  throw new Error('SESSION_SECRET must be set in production');
}
