import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../')

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      // ── Shell & Core ──
      '@': path.resolve(__dirname, 'src'),

      // ── Shared Packages (Horizontal Layers) ──
      '@sgroup/design-system': path.resolve(rootDir, 'packages/design-system/src'),
      '@sgroup/types': path.resolve(rootDir, 'packages/types/src'),
      '@sgroup/ui': path.resolve(rootDir, 'packages/ui/src'),
      '@sgroup/ui-kit': path.resolve(rootDir, 'packages/web-ui/src'),
      '@sgroup/api-client': path.resolve(rootDir, 'packages/api-client/src'),
      '@sgroup/platform': path.resolve(rootDir, 'packages/platform/src'),
      '@sgroup/web-ui': path.resolve(rootDir, 'packages/web-ui/src'),

      // ── Feature Modules (Vertical Slices) ──
      // Each alias points to the module's barrel index.ts
      '@modules/hr': path.resolve(rootDir, 'modules/hr/web'),
      '@modules/project': path.resolve(rootDir, 'modules/project/web'),
      '@modules/sales': path.resolve(rootDir, 'modules/sales/web'),
    },
  },
  server: {
    port: 5173,
    fs: {
      allow: [rootDir],
    },
    proxy: {
      '/api/hr': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/project': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api\/project/, '/api'),
      },
      '/api/sales': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api\/sales/, '/api'),
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
