import { env } from './config/env.js';
import { connectDb, disconnectDb } from './config/db.js';
import { createApp } from './app.js';

async function main() {
  await connectDb();
  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`ShopSphere API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  // Close the HTTP server and the database connection cleanly (Ctrl+C or a platform stop signal).
  const shutdown = (signal) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('Could not start the server:', error.message);
  process.exit(1);
});
