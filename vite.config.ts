import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function faviconHrefFromBase(): string {
  const raw = process.env.VITE_BASE || '/'
  const withSlash = raw.endsWith('/') ? raw : `${raw}/`
  return withSlash === '/' ? '/favicon.svg' : `${withSlash}favicon.svg`
}

export default defineConfig({
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
