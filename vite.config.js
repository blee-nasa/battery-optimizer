import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
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
    host: 'localhost',
    port: 3000,
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
