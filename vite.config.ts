import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function faviconHrefFromBase(): string {
  const raw = process.env.VITE_BASE || '/'
  const withSlash = raw.endsWith('/') ? raw : `${raw}/`
  return withSlash === '/' ? '/favicon.svg' : `${withSlash}favicon.svg`
}

const apiProxyPattern = '^/(projects|chapters|team|auth|glossary|files|trash|health)'

export default defineConfig({
  server: {
    proxy: {
      [apiProxyPattern]: {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    {
      name: 'html-favicon-base',
      transformIndexHtml(html) {
        return html.replace('href="/favicon.svg"', `href="${faviconHrefFromBase()}"`)
      },
    },
  ],
  base: process.env.VITE_BASE || '/',
})
