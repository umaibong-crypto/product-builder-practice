import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages serves this project from /product-builder-practice/,
// but Cloudflare Pages (and most other hosts) serve it from the domain root.
// Cloudflare Pages sets CF_PAGES=1 automatically during its build.
const base = process.env.CF_PAGES ? '/' : '/product-builder-practice/'

export default defineConfig({
  plugins: [react()],
  base,
})
