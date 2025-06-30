import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname),
      '~': resolve(__dirname),
      'assets': resolve(__dirname, 'assets'),
      'components': resolve(__dirname, 'components'),
      'composables': resolve(__dirname, 'composables'),
      'store': resolve(__dirname, 'store'),
      'i18n': resolve(__dirname, 'i18n'),
      'utils': resolve(__dirname, 'composables/utils'),
      'types': resolve(__dirname, 'types')
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      'tests/e2e/**' // Исключаем E2E тесты - они для Playwright
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '.nuxt/**',
        '.output/**',
        'node_modules/**',
        'tests/e2e/**',
        'tests/setup/**',
        'tests/mocks/**',
        'tests/fixtures/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test{,s}/**',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/__tests__/**',
        'server/api/debug/**'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  }
}) 