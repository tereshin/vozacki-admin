import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
// импортируем динамически в самих тестах после настройки моков

// Stubs for reactivity
vi.stubGlobal('ref', (v:any)=>({value:v}))
vi.stubGlobal('computed', (arg:any)=>{
  if(typeof arg==='function') {
    return { value: arg() }
  }
  if(arg && typeof arg.get==='function') {
    return { value: arg.get() }
  }
  return { value: undefined }
})
vi.stubGlobal('readonly', (v:any)=>v)

const mockLanguages = [
  { id: '1', code: 'en', is_active: true },
  { id: '2', code: 'ru', is_active: true }
]

// Mock CacheManager
vi.stubGlobal('useCacheManager', () => ({ getCachedActiveLanguages: vi.fn(async () => mockLanguages) }))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string,string> = {}
  return {
    getItem: (key:string) => store[key] || null,
    setItem: (key:string, value:string) => { store[key]=value },
    clear: () => { store = {} }
  }
})()
;(global as any).localStorage = localStorageMock

;(global as any).process = { client: true }

describe('useAppSettings', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('initSettings загружает default значение, затем сохраняет и возвращает язык', async () => {
    const { useAppSettings } = await import('~/composables/core/config/useAppSettings')
    const appSettings = useAppSettings()
    await appSettings.initSettings()
    expect(appSettings.contentLanguageId.value).toBe('sr-lat')
  })

  it('setContentLanguageByCode сохраняет язык в localStorage', async () => {
    const { useAppSettings } = await import('~/composables/core/config/useAppSettings')
    const appSettings = useAppSettings()
    await appSettings.setContentLanguageByCode('en')
    const stored = JSON.parse(localStorageMock.getItem('app-settings') as string)
    expect(stored.contentLanguageId).toBe('1')
  })
}) 