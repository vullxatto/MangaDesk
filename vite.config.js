import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig(({ command }) => ({
  // For GitHub Pages project sites: https://<user>.github.io/<repo>/
  // Override via env in CI if needed.
  base: command === 'build' ? (process.env.VITE_BASE ?? '/MangaDesk/') : '/',
  plugins: [react(), injectHTML()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        examples: resolve(__dirname, 'examples.html'),
        auth: resolve(__dirname, 'auth.html'),
        dashboard: resolve(__dirname, 'dashboard/index.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
}));