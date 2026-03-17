import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import { resolve } from 'node:path';

export default defineConfig(({ command }) => ({
  // For GitHub Pages project sites: https://<user>.github.io/<repo>/
  // Override via env in CI if needed.
  base: command === 'build' ? (process.env.VITE_BASE ?? '/MangaDesk/') : '/',
  plugins: [injectHTML()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        auth: resolve(__dirname, 'auth.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
}));