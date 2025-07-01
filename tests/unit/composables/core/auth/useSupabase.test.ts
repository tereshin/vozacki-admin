import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSupabase } from '~/composables/core/auth/useSupabase'

// Mock Nuxt app with supabase client
const supabaseClientMock = { auth: {} }

const setupNuxtApp = () => {
  vi.stubGlobal('useNuxtApp', () => ({ $supabase: supabaseClientMock }))
}

describe('useSupabase', () => {
  beforeEach(() => {
    vi.resetModules()
    setupNuxtApp()
    // Ensure process.server false
    ;(global as any).process = { server: false, client: true }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('возвращает Supabase клиент, если он доступен', () => {
    const client = useSupabase()
    expect(client).toBe(supabaseClientMock)
  })

  it('кидает ошибку на server-среде', () => {
    ;(global as any).process.server = true
    expect(() => useSupabase()).toThrow()
  })
}) 