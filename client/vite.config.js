import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development the React app (port 5173) forwards every /api request to the
// Express server (port 5000). To the browser it is all one origin, so the session cookie
// needs no special CORS or cookie settings.
const api = { '/api': { target: 'http://localhost:5000', changeOrigin: true } };

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: api,
  },
  preview: {
    proxy: api,
  },
});
