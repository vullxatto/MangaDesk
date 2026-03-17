import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  plugins: [injectHTML()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        auth: resolve(__dirname, 'auth.html'),
      },
    },
  },
});