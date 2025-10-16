import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'tests/int/**/*.int.spec.ts',
      'tests/unit/**/*.test.ts',
      'tests/unit/**/*.test.tsx'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      // Exclude API integration tests that require running server
      'tests/int/painting-api.int.spec.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage'
    }
  },
})
