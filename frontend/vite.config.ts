import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const API_TEST_ORIGIN = 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: API_TEST_ORIGIN } },
    env: { VITE_API_BASE_URL: API_TEST_ORIGIN },
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  },
})
