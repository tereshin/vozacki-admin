import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock global ref before any imports
const mockRef = vi.fn((value: any) => ({
  value,
  __v_isRef: true
}))
vi.stubGlobal('ref', mockRef)

// Mock readonly function
const mockReadonly = vi.fn((value: any) => value)
vi.stubGlobal('readonly', mockReadonly)

// Mock pinia
vi.mock('pinia', () => ({
  defineStore: (_id: string, setup: any) => setup
}))

// Mock API functions
const getRolesSpy = vi.fn()
const getAllRolesSpy = vi.fn()

// Mock useRolesApi
vi.mock('~/composables/api/useRolesApi', () => ({
  useRolesApi: () => ({
    getRoles: getRolesSpy,
    getAllRoles: getAllRolesSpy
  })
}))

// Mock cache manager
const getCachedRolesSpy = vi.fn()
vi.mock('~/composables/cache/useCacheManager', () => ({
  useCacheManager: () => ({
    getCachedRoles: getCachedRolesSpy,
    isInitialized: ref(true),
    isLoading: ref(false),
    clearCache: vi.fn(),
    getCacheStatus: vi.fn().mockReturnValue({
      isInitialized: true,
      isLoading: false,
      lastUpdated: Date.now()
    })
  })
}))

// Import store after all mocks are set up
import { useRolesStore } from '~/store/roles'

// Mock API responses
const mockRole = {
  id: '1',
  name: 'Admin',
  code: 'admin',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

const mockCachedRoles = [
  mockRole,
  {
    id: '2',
    name: 'Editor',
    code: 'editor',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Viewer',
    code: 'viewer',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
]

describe('useRolesStore', () => {
  let store: ReturnType<typeof useRolesStore>

  beforeEach(() => {
    vi.clearAllMocks()
    store = useRolesStore()
    
    // Reset mock implementations
    getCachedRolesSpy.mockResolvedValue(mockCachedRoles)
    getRolesSpy.mockResolvedValue({
      data: {
        collection: mockCachedRoles,
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          per_page: 10,
          to: mockCachedRoles.length,
          total: mockCachedRoles.length
        }
      }
    })
    getAllRolesSpy.mockResolvedValue({
      data: mockCachedRoles
    })
  })

  it('initializes with default values', () => {
    expect((store.items as any).value).toEqual([])
    expect((store.allRoles as any).value).toEqual([])
    expect((store.loading as any).value).toBe(false)
    expect((store.error as any).value).toBeNull()
    expect((store.meta as any).value).toEqual({
      current_page: 1,
      from: 1,
      last_page: 1,
      per_page: 10,
      to: 10,
      total: 0
    })
  })

  describe('getRoles', () => {
    it('fetches roles from cache successfully', async () => {
      const response = await store.getRoles()
      
      expect(getCachedRolesSpy).toHaveBeenCalled()
      expect((store.items as any).value).toEqual(mockCachedRoles.slice(0, 10))
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
      expect(response.data.collection).toEqual(mockCachedRoles.slice(0, 10))
    })

    it('filters roles by search term', async () => {
      const response = await store.getRoles({ search: 'admin' })
      
      const filteredRoles = mockCachedRoles.filter(role => 
        role.name.toLowerCase().includes('admin') || 
        role.code.toLowerCase().includes('admin')
      )
      expect((store.items as any).value).toEqual(filteredRoles)
      expect(response.data.collection).toEqual(filteredRoles)
    })

    it('handles pagination correctly', async () => {
      const response = await store.getRoles({ page: 2, per_page: 1 })
      
      expect((store.items as any).value).toEqual([mockCachedRoles[1]])
      expect((store.meta as any).value.current_page).toBe(2)
      expect((store.meta as any).value.per_page).toBe(1)
      expect(response.data.collection).toEqual([mockCachedRoles[1]])
    })

    it('handles cache error', async () => {
      const error = new Error('Failed to fetch from cache')
      getCachedRolesSpy.mockRejectedValueOnce(error)
      getRolesSpy.mockRejectedValueOnce(error) // Also reject the API fallback

      await expect(store.getRoles()).rejects.toThrow('Failed to fetch from cache')
      expect((store.error as any).value).toBe('Failed to fetch from cache')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('getAllRoles', () => {
    it('fetches all roles successfully', async () => {
      const result = await store.getAllRoles()
      
      expect(getCachedRolesSpy).toHaveBeenCalled()
      expect(result).toEqual(mockCachedRoles)
      expect((store.allRoles as any).value).toEqual(mockCachedRoles)
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
    })

    it('handles cache error', async () => {
      const error = new Error('Failed to fetch from cache')
      getCachedRolesSpy.mockRejectedValueOnce(error)
      getAllRolesSpy.mockRejectedValueOnce(error) // Also reject the API fallback

      await expect(store.getAllRoles()).rejects.toThrow('Failed to fetch from cache')
      expect((store.error as any).value).toBe('Failed to fetch from cache')
      expect((store.loading as any).value).toBe(false)
    })
  })
}) 