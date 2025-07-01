import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCachedRoles } from '~/composables/cache/useCachedRoles'

const mockRoles = [
  { id: '1', name: 'Admin', code: 'admin' },
  { id: '2', name: 'Editor', code: 'editor' }
] as any

let cacheManagerMock: any

vi.mock('~/composables/cache/useCacheManager', () => ({
  useCacheManager: () => cacheManagerMock
}))

describe('useCachedRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cacheManagerMock = {
      getCachedRoles: vi.fn().mockResolvedValue(mockRoles)
    }
    vi.stubGlobal('useLanguagesApi', () => ({
      getLanguages: vi.fn().mockResolvedValue({ data: { collection: [] } })
    }))
    vi.stubGlobal('useRolesApi', () => ({
      getAllRoles: vi.fn().mockResolvedValue(mockRoles)
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

  it('loadRoles fetches and caches roles', async () => {
    const { loadRoles, cachedRoles } = useCachedRoles()
    const res = await loadRoles()
    expect(res).toEqual(mockRoles)
    expect(cachedRoles.value).toEqual(mockRoles)
    expect(cacheManagerMock.getCachedRoles).toHaveBeenCalled()
  })

  it('getRoleByCode finds role', async () => {
    const { getRoleByCode } = useCachedRoles()
    const role = await getRoleByCode('editor')
    expect(role?.id).toBe('2')
  })

  it('refreshRoles forces reload', async () => {
    const { loadRoles, refreshRoles } = useCachedRoles()
    await loadRoles()
    cacheManagerMock.getCachedRoles.mockResolvedValue([])
    await refreshRoles()
    expect(cacheManagerMock.getCachedRoles).toHaveBeenCalledTimes(2)
  })
}) 