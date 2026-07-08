import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Admin bundle is hosted at the **subdomain root** (e.g. https://admin.site.com/)
// rather than under a /admin prefix. So Vite's `base` is `/` — all asset URLs
// in the built HTML resolve from the domain root.
//
// Dev proxy unchanged — Vite still forwards `/api/*` to the local API on
// :3000 in the same way it always did.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 5174,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Emit into `admin/dist` (existing layout). The `collect-dist` script
    // then drops it under `dist/` at the repo root when bundling for
    // deployment; the server picks the right shell at request time based
    // on the request's Host header (`ADMIN_PUBLIC_HOST`).
    outDir: 'dist',
    emptyOutDir: true,
  },
});