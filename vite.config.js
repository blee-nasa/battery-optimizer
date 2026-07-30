import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Single source of truth for the app version, surfaced in the About dialog.
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@App': path.resolve(__dirname, 'src/App/App.tsx'),
      '@utils': path.resolve(__dirname, 'src/utils/index.ts'),
      '@components': path.resolve(__dirname, 'src/components/index.ts'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@views': path.resolve(__dirname, 'src/views/index.ts'),
      '@stores': path.resolve(__dirname, 'src/stores/index.ts'),
      '@types': path.resolve(__dirname, 'src/types/index.ts'),
    },
  },
  server: {
    // In Docker, bind to all interfaces so port mapping (host:container) works.
    host: '0.0.0.0',
    port: 47293,
    watch: {
      // polling is needed for hot reload on mounted volumes (Docker on Windows/WSL)
      usePolling: true,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
    coverage: {
      provider: 'istanbul',
      all: true,
      include: ['src/**'],
      exclude: ['src/main.tsx'],
      reportOnFailure: true,
    },
    forceRerunTriggers: ['src/**'],
  },
})
