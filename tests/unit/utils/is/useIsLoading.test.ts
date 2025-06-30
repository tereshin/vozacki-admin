import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useIsLoading } from '../../../../composables/utils/is/useIsLoading'

// Мокаем general store
const mockGeneralStore = {
  isLoading: false
}

vi.mock('../../../../store/general', () => ({
  useGeneralStore: () => mockGeneralStore
}))

describe('useIsLoading', () => {
  beforeEach(() => {
    // Сбрасываем состояние перед каждым тестом
    mockGeneralStore.isLoading = false
  })

  it('should set loading state to true', () => {
    useIsLoading(true)
    expect(mockGeneralStore.isLoading).toBe(true)
  })

  it('should set loading state to false', () => {
    // Сначала устанавливаем true
    useIsLoading(true)
    expect(mockGeneralStore.isLoading).toBe(true)
    
    // Затем устанавливаем false
    useIsLoading(false)
    expect(mockGeneralStore.isLoading).toBe(false)
  })

  it('should handle multiple calls correctly', () => {
    useIsLoading(true)
    expect(mockGeneralStore.isLoading).toBe(true)
    
    useIsLoading(true) // повторный вызов с true
    expect(mockGeneralStore.isLoading).toBe(true)
    
    useIsLoading(false)
    expect(mockGeneralStore.isLoading).toBe(false)
    
    useIsLoading(false) // повторный вызов с false
    expect(mockGeneralStore.isLoading).toBe(false)
  })

  it('should work with different boolean values', () => {
    // Проверяем, что функция принимает именно boolean
    useIsLoading(Boolean(1))
    expect(mockGeneralStore.isLoading).toBe(true)
    
    useIsLoading(Boolean(0))
    expect(mockGeneralStore.isLoading).toBe(false)
    
    useIsLoading(Boolean('test'))
    expect(mockGeneralStore.isLoading).toBe(true)
    
    useIsLoading(Boolean(''))
    expect(mockGeneralStore.isLoading).toBe(false)
  })
}) 