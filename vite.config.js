import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig(({ command }) => ({
  // For GitHub Pages project sites: https://<user>.github.io/<repo>/
  // Override via env in CI if needed.
  base: command === 'build' ? (process.env.VITE_BASE ?? '/MangaDesk/') : '/',
  plugins: [react()],
  assetsInclude: ['**/*.mov', '**/*.MOV'],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom'),
      'lucide-react': resolve(__dirname, 'node_modules/lucide-react'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
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