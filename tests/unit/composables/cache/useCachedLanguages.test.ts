import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCachedLanguages } from '~/composables/cache/useCachedLanguages'

const mockLanguages = [
  { id: '1', name: 'English', code: 'en', is_active: true },
  { id: '2', name: 'Russian', code: 'ru', is_active: false }
] as any

let cacheManagerMock: any

vi.mock('~/composables/cache/useCacheManager', () => ({
  useCacheManager: () => cacheManagerMock
}))

describe('useCachedLanguages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cacheManagerMock = {
      getCachedLanguages: vi.fn().mockResolvedValue(mockLanguages),
      getCachedActiveLanguages: vi.fn().mockResolvedValue(mockLanguages.filter((l:any)=>l.is_active)),
    }
    vi.stubGlobal('useLanguagesApi', () => ({
      getLanguages: vi.fn().mockResolvedValue({ data: { collection: mockLanguages } })
    }))
    vi.stubGlobal('useRolesApi', () => ({
      getAllRoles: vi.fn().mockResolvedValue([])
    }))
    vi.stubGlobal('useIndexedDB', () => ({
      initDB: vi.fn(),
      getLanguages: vi.fn().mockResolvedValue([]),
      getRoles: vi.fn().mockResolvedValue([]),
      getActiveLanguages: vi.fn().mockResolvedValue([]),
      saveLanguages: vi.fn(),
      saveRoles: vi.fn(),
      saveCacheMeta: vi.fn(),
      getCacheMeta: vi.fn(),
      clearCache: vi.fn()
    }))
    vi.stubGlobal('ref', (val:any)=>({value:val}))
    vi.stubGlobal('computed', (getter:any)=>({value:getter()}))
    vi.stubGlobal('readonly', (v:any)=>v)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loadLanguages fetches and caches languages', async () => {
    const { loadLanguages, cachedLanguages, isLoading } = useCachedLanguages()
    const res = await loadLanguages()
    expect(res).toEqual(mockLanguages)
    expect(cachedLanguages.value).toEqual(mockLanguages)
    expect(isLoading.value).toBe(false)
    expect(cacheManagerMock.getCachedLanguages).toHaveBeenCalled()
  })

  it('loadActiveLanguages returns only active languages', async () => {
    const { loadActiveLanguages, cachedActiveLanguages } = useCachedLanguages()
    const res = await loadActiveLanguages()
    expect(res).toEqual([mockLanguages[0]])
    expect(cachedActiveLanguages.value).toEqual([mockLanguages[0]])
  })

  it('getLanguageByCode finds language', async () => {
    const { getLanguageByCode } = useCachedLanguages()
    const lang = await getLanguageByCode('ru')
    expect(lang?.id).toBe('2')
  })

  it('refreshLanguages forces reload and clears cache', async () => {
    const { loadLanguages, refreshLanguages, cachedLanguages } = useCachedLanguages()
    await loadLanguages()
    expect(cachedLanguages.value.length).toBe(2)
    cacheManagerMock.getCachedLanguages.mockResolvedValue([])
    await refreshLanguages()
    expect(cacheManagerMock.getCachedLanguages).toHaveBeenCalledTimes(2)
  })
}) 