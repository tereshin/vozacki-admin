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
const getLanguagesSpy = vi.fn()
const getSingleLanguageSpy = vi.fn()
const createLanguageSpy = vi.fn()
const updateLanguageSpy = vi.fn()
const deleteLanguageSpy = vi.fn()

// Mock useLanguagesApi
vi.mock('~/composables/api/useLanguagesApi', () => ({
  useLanguagesApi: () => ({
    getLanguages: getLanguagesSpy,
    getSingleLanguage: getSingleLanguageSpy,
    createLanguage: createLanguageSpy,
    updateLanguage: updateLanguageSpy,
    deleteLanguage: deleteLanguageSpy
  })
}))

// Mock cache manager
const getCachedLanguagesSpy = vi.fn()
vi.mock('~/composables/cache/useCacheManager', () => ({
  useCacheManager: () => ({
    getCachedLanguages: getCachedLanguagesSpy,
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
import { useLanguagesStore } from '~/store/languages'

// Mock API responses
const mockLanguage = {
  id: '1',
  name: 'English',
  code: 'en',
  is_active: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

const mockCachedLanguages = [
  mockLanguage,
  {
    id: '2',
    name: 'Russian',
    code: 'ru',
    is_active: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Serbian',
    code: 'sr',
    is_active: false,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
]

describe('useLanguagesStore', () => {
  let store: ReturnType<typeof useLanguagesStore>

  beforeEach(() => {
    vi.clearAllMocks()
    store = useLanguagesStore()
    
    // Reset mock implementations
    getCachedLanguagesSpy.mockResolvedValue(mockCachedLanguages)
    getLanguagesSpy.mockResolvedValue({
      data: {
        collection: mockCachedLanguages,
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          per_page: 10,
          to: mockCachedLanguages.length,
          total: mockCachedLanguages.length
        }
      }
    })
    getSingleLanguageSpy.mockResolvedValue({ data: mockLanguage })
    createLanguageSpy.mockResolvedValue({ data: mockLanguage })
    updateLanguageSpy.mockResolvedValue({ 
      data: { ...mockLanguage, name: 'Updated English' } 
    })
    deleteLanguageSpy.mockResolvedValue({})
  })

  it('initializes with default values', () => {
    expect((store.items as any).value).toEqual([])
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

  describe('getLanguages', () => {
    it('fetches languages from cache successfully', async () => {
      const response = await store.getLanguages()
      
      expect(getCachedLanguagesSpy).toHaveBeenCalled()
      expect((store.items as any).value).toEqual(mockCachedLanguages.slice(0, 10))
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
      expect(response.data.collection).toEqual(mockCachedLanguages.slice(0, 10))
    })

    it('filters languages by is_active', async () => {
      const response = await store.getLanguages({ is_active: true })
      
      const activeLanguages = mockCachedLanguages.filter(lang => lang.is_active)
      expect((store.items as any).value).toEqual(activeLanguages)
      expect(response.data.collection).toEqual(activeLanguages)
    })

    it('filters languages by search term', async () => {
      const response = await store.getLanguages({ search: 'ru' })
      
      const filteredLanguages = mockCachedLanguages.filter(lang => 
        lang.name.toLowerCase().includes('ru') || 
        lang.code.toLowerCase().includes('ru')
      )
      expect((store.items as any).value).toEqual(filteredLanguages)
      expect(response.data.collection).toEqual(filteredLanguages)
    })

    it('handles pagination correctly', async () => {
      const response = await store.getLanguages({ page: 2, per_page: 1 })
      
      expect((store.items as any).value).toEqual([mockCachedLanguages[1]])
      expect((store.meta as any).value.current_page).toBe(2)
      expect((store.meta as any).value.per_page).toBe(1)
      expect(response.data.collection).toEqual([mockCachedLanguages[1]])
    })

    it('handles cache error', async () => {
      const error = new Error('Failed to fetch from cache')
      getCachedLanguagesSpy.mockRejectedValueOnce(error)
      getLanguagesSpy.mockRejectedValueOnce(error) // Also reject the API fallback

      await expect(store.getLanguages()).rejects.toThrow('Failed to fetch from cache')
      expect((store.error as any).value).toBe('Failed to fetch from cache')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('getSingleLanguage', () => {
    it('fetches single language successfully', async () => {
      const result = await store.getSingleLanguage('1')
      
      expect(getSingleLanguageSpy).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockLanguage)
      expect((store.loading as any).value).toBe(false)
      expect((store.error as any).value).toBeNull()
    })

    it('handles error when language not found', async () => {
      const error = new Error('Language not found')
      getSingleLanguageSpy.mockRejectedValueOnce(error)

      await expect(store.getSingleLanguage('999')).rejects.toThrow('Language not found')
      expect((store.error as any).value).toBe('Language not found')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('createLanguage', () => {
    it('creates language successfully', async () => {
      const newLanguage = {
        name: 'French',
        code: 'fr',
        is_active: true
      }
      const result = await store.createLanguage(newLanguage)
      
      expect(createLanguageSpy).toHaveBeenCalledWith(newLanguage)
      expect(result).toEqual(mockLanguage)
      expect((store.items as any).value[0]).toEqual(mockLanguage)
      expect((store.meta as any).value.total).toBe(1)
    })

    it('handles validation errors', async () => {
      const error = new Error('Validation failed')
      createLanguageSpy.mockRejectedValueOnce(error)
      const invalidLanguage = {
        name: '',
        code: '',
        is_active: true
      }

      await expect(store.createLanguage(invalidLanguage)).rejects.toThrow('Validation failed')
      expect((store.error as any).value).toBe('Validation failed')
      expect((store.loading as any).value).toBe(false)
    })
  })

  describe('updateLanguage', () => {
    it('updates language successfully', async () => {
      // First add a language to update
      await store.getLanguages()
      
      const updateData = { name: 'Updated English' }
      const result = await store.updateLanguage('1', updateData)
      
      expect(updateLanguageSpy).toHaveBeenCalledWith('1', updateData)
      expect(result.name).toBe('Updated English')
      expect((store.items as any).value[0].name).toBe('Updated English')
    })

    it('handles non-existent language update', async () => {
      const updateData = { name: 'Updated English' }
      const result = await store.updateLanguage('999', updateData)
      
      expect(updateLanguageSpy).toHaveBeenCalledWith('999', updateData)
      expect(result.name).toBe('Updated English')
      // Should not modify items array since language wasn't found
      expect((store.items as any).value.length).toBe(0)
    })
  })

  describe('deleteLanguage', () => {
    it('deletes language successfully', async () => {
      // First add languages to delete
      await store.getLanguages()
      
      await store.deleteLanguage('1')
      
      expect(deleteLanguageSpy).toHaveBeenCalledWith('1')
      expect((store.items as any).value).toHaveLength(2)
      expect((store.meta as any).value.total).toBe(2)
    })

    it('handles non-existent language deletion', async () => {
      await store.deleteLanguage('999')
      
      expect(deleteLanguageSpy).toHaveBeenCalledWith('999')
      // Should not modify meta since language wasn't in the list
      expect((store.meta as any).value.total).toBe(0)
    })

    it('handles deletion error', async () => {
      const error = new Error('Cannot delete language in use')
      deleteLanguageSpy.mockRejectedValueOnce(error)

      await expect(store.deleteLanguage('1')).rejects.toThrow('Cannot delete language in use')
      expect((store.error as any).value).toBe('Cannot delete language in use')
      expect((store.loading as any).value).toBe(false)
    })
  })
}) 