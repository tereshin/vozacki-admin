import { vi } from 'vitest'

export const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }))
}

export const mockAuthUser = {
  id: '1',
  email: 'test@example.com',
  user_metadata: {
    role: 'admin'
  },
  created_at: '2024-01-01T00:00:00.000Z'
}

export const mockAuthError = {
  message: 'Invalid credentials',
  status: 400
} 