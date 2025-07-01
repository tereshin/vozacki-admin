import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock pinia defineStore
vi.mock('pinia', () => ({
  defineStore: (_id: string, setup: any) => setup
}))

// Vue reactivity stubs
const createRef = (v: any) => ({
  value: v,
  __v_isRef: true
})
vi.stubGlobal('ref', createRef)

import { useGeneralStore } from '~/store/general'

describe('useGeneralStore', () => {
  let store: ReturnType<typeof useGeneralStore>
  let addEventListenerSpy: any
  let removeEventListenerSpy: any

  beforeEach(() => {
    // Mock window methods
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920
    })

    store = useGeneralStore()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    expect((store.isLoading as any).value).toBe(false)
    expect((store.isMenuOpen as any).value).toBe(true)
    expect((store.isMobile as any).value).toBe(false)
  })

  describe('mobile detection', () => {
    it('updates mobile status based on window width', () => {
      // Desktop width
      window.innerWidth = 1920
      store.updateMobileStatus()
      expect((store.isMobile as any).value).toBe(false)

      // Mobile width
      window.innerWidth = 768
      store.updateMobileStatus()
      expect((store.isMobile as any).value).toBe(true)
    })

    it('initializes mobile detection with event listener', () => {
      store.initMobileDetection()
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', store.updateMobileStatus)
    })

    it('removes event listener on destroy', () => {
      store.destroyMobileDetection()
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', store.updateMobileStatus)
    })
  })
}) 