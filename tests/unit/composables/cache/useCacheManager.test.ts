import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Тестируемый composable импортируем динамически после настройки моков
// чтобы гарантировать, что синглтон создаётся с корректными зависимостями

// Объявляем переменные для мок-данных и функций
let mockLanguages: any[]
let mockRoles: any[]
let dbStubs: any
let languagesApiMock: any
let rolesApiMock: any

const createIndexedDbMock = () => {
  const state = {
    langs: [] as any[],
    roles: [] as any[],
    meta: null as Date | null
  }
  return {
    initDB: vi.fn(async () => undefined),
    saveLanguages: vi.fn(async (langs: any[]) => { state.langs = [...langs] }),
    saveRoles: vi.fn(async (roles: any[]) => { state.roles = [...roles] }),
    getLanguages: vi.fn(async () => state.langs),
    getRoles: vi.fn(async () => state.roles),
    getActiveLanguages: vi.fn(async () => state.langs.filter(l => l.is_active)),
    saveCacheMeta: vi.fn(async (d: Date) => { state.meta = d }),
    getCacheMeta: vi.fn(async () => state.meta),
    clearCache: vi.fn(async () => {
      state.langs = []
      state.roles = []
      state.meta = null
    })
  }
}

const setupGlobalStubs = () => {
  vi.stubGlobal('ref', (v: any) => ({ value: v }))
  vi.stubGlobal('readonly', (v: any) => v)
}

const setupApiStubs = () => {
  languagesApiMock = {
    getLanguages: vi.fn(async () => ({ data: { collection: mockLanguages } }))
  }
  rolesApiMock = {
    getAllRoles: vi.fn(async () => mockRoles)
  }
  vi.stubGlobal('useLanguagesApi', () => languagesApiMock)
  vi.stubGlobal('useRolesApi', () => rolesApiMock)
}

describe('useCacheManager', () => {
  beforeEach(async () => {
    vi.resetModules()
    mockLanguages = [
      { id: '1', name: 'English', code: 'en', is_active: true },
      { id: '2', name: 'Russian', code: 'ru', is_active: false }
    ]
    mockRoles = [
      { id: '1', name: 'Admin', code: 'admin' },
      { id: '2', name: 'Editor', code: 'editor' }
    ]

    dbStubs = createIndexedDbMock()

    // Мокаем IndexedDB composable
    vi.mock('~/composables/utils/data/useIndexedDB', () => ({
      useIndexedDB: () => dbStubs
    }))

    setupApiStubs()
    setupGlobalStubs()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  const getCacheManager = async () => {
    const { useCacheManager } = await import('~/composables/cache/useCacheManager')
    return useCacheManager()
  }

  it('initializes cache and returns cached data', async () => {
    const cache = await getCacheManager()

    const languages = await cache.getCachedLanguages()
    const roles = await cache.getCachedRoles()

    expect(languages).toEqual(mockLanguages)
    expect(roles).toEqual(mockRoles)

    // Проверяем, что данные были сохранены в IndexedDB
    expect(dbStubs.saveLanguages).toHaveBeenCalledWith(mockLanguages)
    expect(dbStubs.saveRoles).toHaveBeenCalledWith(mockRoles)
  })

  it('returns only active languages', async () => {
    const cache = await getCacheManager()
    const active = await cache.getCachedActiveLanguages()
    expect(active).toEqual([mockLanguages[0]])
  })

  it('forceUpdateCache перезаписывает кэш', async () => {
    const cache = await getCacheManager()

    // Инициализируем кэш
    await cache.getCachedLanguages()
    expect(dbStubs.saveLanguages).toHaveBeenCalledTimes(1)

    // Меняем данные, которые вернёт API
    const newLanguages = [{ id: '3', name: 'Serbian', code: 'sr', is_active: true }]
    languagesApiMock.getLanguages.mockResolvedValue({ data: { collection: newLanguages } })

    await cache.forceUpdateCache()

    // saveLanguages должен быть вызван повторно уже с новыми данными
    expect(dbStubs.saveLanguages).toHaveBeenCalledTimes(2)
    expect(dbStubs.saveLanguages).toHaveBeenLastCalledWith(newLanguages)
  })

  it('clearCache стирает данные из IndexedDB', async () => {
    const cache = await getCacheManager()

    // Заполняем кэш
    await cache.getCachedLanguages()
    expect(await dbStubs.getLanguages()).toEqual(mockLanguages)

    // Очищаем кэш
    await cache.clearCache()
    expect(dbStubs.clearCache).toHaveBeenCalled()
    expect(await dbStubs.getLanguages()).toEqual([])
  })
}) 