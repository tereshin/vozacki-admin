import { vi } from 'vitest'
import type { AdministratorUser, LoginResponse } from '~/types/auth'

// Глобальные моки
global.fetch = vi.fn()
global.$fetch = vi.fn() as any

// Мок для Nuxt композаблов
vi.mock('#app', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    defineNuxtPlugin: vi.fn(),
    useNuxtApp: () => ({
      $router: {
        push: vi.fn(),
        replace: vi.fn()
      }
    }),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn()
    }),
    useRoute: () => ({
      path: '/login'
    }),
    navigateTo: vi.fn(),
    useRuntimeConfig: () => ({
      public: {
        supabaseUrl: 'http://localhost:54321',
        supabasePublishableKey: 'test-key',
        appUrl: 'http://localhost:3000'
      }
    })
  }
})

// Мок для Pinia
vi.mock('pinia', () => ({
  defineStore: vi.fn(() => vi.fn()),
  storeToRefs: vi.fn()
}))

// Мок для Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }))
}))

// Утилиты для тестов
export const createMockUser = (overrides: Partial<AdministratorUser> = {}): AdministratorUser => ({
  id: '1',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  full_name: 'Test User',
  role: {
    id: '1',
    name: 'Administrator',
    code: 'admin'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const createMockLoginResponse = (user?: AdministratorUser): LoginResponse => ({
  user: user || createMockUser(),
  session: {
    access_token: 'mock-jwt-token',
    expires_in: 3600,
    user: user || createMockUser()
  }
}) 